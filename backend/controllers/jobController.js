/**
 * controllers/jobController.js — Job Posting Management
 *
 * WHAT: Full CRUD for job postings plus advanced search/filter for freelancers.
 * HOW:
 *   createJob     — client only; creates a new job doc
 *   getAllJobs    — public; paginated search with multi-field filtering
 *   getJobById   — public; single job with client info and application count
 *   updateJob    — client only; updates own job (guards against editing closed jobs)
 *   deleteJob    — client only; soft-deletes own job
 *   getMyJobs    — client only; returns all jobs posted by the requester
 *   getJobCategories — public; returns the list of valid categories
 * WHY:  Controllers stay thin — they orchestrate models and return responses;
 *       all schema-level validation is in the Mongoose model.
 */

const Job = require('../models/Job');
const Application = require('../models/Application');
const { parsePaginationParams, buildPaginationMeta } = require('../utils/pagination');

// ─── POST /api/jobs ──────────────────────────────────────────────────────────
/**
 * Create a new job. Client only.
 * Body: { title, description, category, skills, budgetType, budgetMin, budgetMax,
 *         deadline, location, experienceLevel }
 */
exports.createJob = async (req, res, next) => {
  try {
    const {
      title, description, category, skills,
      budgetType, budgetMin, budgetMax,
      deadline, location, experienceLevel,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      category,
      skills:          skills          || [],
      budgetType,
      budgetMin:       Number(budgetMin),
      budgetMax:       Number(budgetMax),
      deadline:        deadline        || undefined,
      location:        location        || 'remote',
      experienceLevel: experienceLevel || 'intermediate',
      client:          req.user._id,
    });

    // Populate client info before returning
    await job.populate('client', 'name email profilePic location');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully.',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/jobs ───────────────────────────────────────────────────────────
/**
 * Public: paginated, filterable, searchable list of open jobs.
 * Query params:
 *   page, limit
 *   search        — full-text search across title, description, skills
 *   category      — exact category match
 *   status        — job status (default: 'open')
 *   location      — 'remote' | 'onsite' | 'hybrid'
 *   experienceLevel — 'entry' | 'intermediate' | 'expert'
 *   budgetType    — 'fixed' | 'hourly'
 *   minBudget     — minimum budgetMin
 *   maxBudget     — maximum budgetMax
 *   skills        — comma-separated required skills
 *   sort          — 'newest' | 'oldest' | 'budget_asc' | 'budget_desc'
 */
exports.getAllJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const {
      search, category, status, location,
      experienceLevel, budgetType, minBudget, maxBudget,
      skills, sort,
    } = req.query;

    const filter = { isActive: true };

    // Status filter — default to 'open' if not provided
    filter.status = status && ['open', 'in_progress', 'completed', 'cancelled'].includes(status)
      ? status
      : 'open';

    // Full-text search
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    if (category) filter.category = category;
    if (location) filter.location = location;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (budgetType) filter.budgetType = budgetType;

    if (minBudget !== undefined || maxBudget !== undefined) {
      filter.budgetMin = {};
      if (minBudget !== undefined) filter.budgetMin.$gte = Number(minBudget);
      if (maxBudget !== undefined) filter.budgetMax = { $lte: Number(maxBudget) };
    }

    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillArray.length) filter.skills = { $in: skillArray };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'oldest')      sortOption = { createdAt: 1 };
    if (sort === 'budget_asc')  sortOption = { budgetMin: 1 };
    if (sort === 'budget_desc') sortOption = { budgetMax: -1 };
    if (search && search.trim()) {
      sortOption = { score: { $meta: 'textScore' }, ...sortOption };
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('client', 'name email profilePic location')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    // Attach application count per job
    const jobIds = jobs.map((j) => j._id);
    const appCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    appCounts.forEach(({ _id, count }) => {
      countMap[_id.toString()] = count;
    });
    const enrichedJobs = jobs.map((job) => ({
      ...job,
      applicationCount: countMap[job._id.toString()] || 0,
    }));

    res.json({
      success: true,
      pagination: buildPaginationMeta(total, page, limit),
      jobs: enrichedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/jobs/:id ───────────────────────────────────────────────────────
/**
 * Public: fetch a single job by ID with full details.
 */
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, isActive: true })
      .populate('client', 'name email profilePic location bio');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Application count for this job
    const applicationCount = await Application.countDocuments({ job: job._id });

    res.json({
      success: true,
      job: { ...job.toJSON(), applicationCount },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/jobs/:id ───────────────────────────────────────────────────────
/**
 * Update a job. Client-only; must own the job.
 * Clients cannot edit jobs that are 'completed' or 'cancelled'.
 */
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, isActive: true });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Ownership check
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorised to edit this job.' });
    }

    if (['completed', 'cancelled'].includes(job.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit a job with status "${job.status}".`,
      });
    }

    const ALLOWED = [
      'title', 'description', 'category', 'skills',
      'budgetType', 'budgetMin', 'budgetMax',
      'deadline', 'location', 'experienceLevel', 'status',
    ];

    const updates = {};
    ALLOWED.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Prevent arbitrary status transitions from client
    if (updates.status && !['open', 'cancelled', 'in_progress'].includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message: 'You can only set status to "open", "in_progress", or "cancelled".',
      });
    }

    const updated = await Job.findByIdAndUpdate(
      job._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('client', 'name email profilePic');

    res.json({ success: true, message: 'Job updated successfully.', job: updated });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/jobs/:id ────────────────────────────────────────────────────
/**
 * Soft-delete a job. Client-only; must own the job.
 */
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, isActive: true });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorised to delete this job.' });
    }

    job.isActive = false;
    job.status = 'cancelled';
    await job.save();

    res.json({ success: true, message: 'Job deleted (soft) successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/jobs/my-jobs ───────────────────────────────────────────────────
/**
 * Client only: return all jobs posted by the authenticated client.
 * Query: page, limit, status
 */
exports.getMyJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { status } = req.query;

    const filter = { client: req.user._id, isActive: true };
    if (status) filter.status = status;

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    // Attach application counts
    const jobIds = jobs.map((j) => j._id);
    const appCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    appCounts.forEach(({ _id, count }) => { countMap[_id.toString()] = count; });

    const enriched = jobs.map((job) => ({
      ...job,
      applicationCount: countMap[job._id.toString()] || 0,
    }));

    res.json({
      success: true,
      pagination: buildPaginationMeta(total, page, limit),
      jobs: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/jobs/categories ────────────────────────────────────────────────
/**
 * Public: return the list of valid job categories.
 */
exports.getJobCategories = (_req, res) => {
  res.json({ success: true, categories: Job.getCategories() });
};
