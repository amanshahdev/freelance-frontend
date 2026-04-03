/**
 * controllers/applicationController.js — Application Lifecycle Management
 *
 * WHAT: Handles all interactions around job applications.
 * HOW:
 *   applyToJob          — freelancer submits an application to an open job
 *   getJobApplications  — client views all applicants for one of their jobs
 *   getMyApplications   — freelancer views all their own applications
 *   getApplicationById  — client or owning freelancer fetches one application
 *   updateApplicationStatus — client changes status (shortlist/accept/reject)
 *   withdrawApplication — freelancer withdraws a pending application
 * WHY:  Separating application logic from job/user controllers keeps each
 *       module small and makes the status-machine transitions explicit.
 */

const Application = require('../models/Application');
const Job = require('../models/Job');
const { parsePaginationParams, buildPaginationMeta } = require('../utils/pagination');

// ─── POST /api/applications ───────────────────────────────────────────────────
/**
 * Freelancer applies to a job.
 * Body: { jobId, coverLetter, proposedRate, estimatedDays }
 */
exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, proposedRate, estimatedDays } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required.' });
    }

    // Validate job exists and is accepting applications
    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: `Cannot apply to a job with status "${job.status}". Only open jobs accept applications.`,
      });
    }

    // Prevent freelancer from applying to their own jobs (edge case)
    if (job.client.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job.' });
    }

    // Check for duplicate application (compound index will also catch this, but
    // we give a friendlier message here)
    const existing = await Application.findOne({ job: jobId, freelancer: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job.',
      });
    }

    const application = await Application.create({
      job:          jobId,
      freelancer:   req.user._id,
      coverLetter,
      proposedRate: Number(proposedRate),
      estimatedDays: Number(estimatedDays),
    });

    await application.populate([
      { path: 'job', select: 'title category budgetType budgetMin budgetMax status' },
      { path: 'freelancer', select: 'name email profilePic skills hourlyRate' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application,
    });
  } catch (error) {
    // Catch unique-index violation as a fallback
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job.',
      });
    }
    next(error);
  }
};

// ─── GET /api/applications/job/:jobId ────────────────────────────────────────
/**
 * Client views all applications for one of their jobs.
 * Query: page, limit, status (filter by application status)
 */
exports.getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { status } = req.query;

    // Verify the job belongs to the requesting client
    const job = await Job.findOne({ _id: jobId, isActive: true }).select('client title');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to view applications for this job.',
      });
    }

    const filter = { job: jobId };
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('freelancer', 'name email profilePic skills hourlyRate bio location portfolio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    res.json({
      success: true,
      job: { _id: job._id, title: job.title },
      pagination: buildPaginationMeta(total, page, limit),
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/applications/my-applications ────────────────────────────────────
/**
 * Freelancer views all of their own applications.
 * Query: page, limit, status
 */
exports.getMyApplications = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { status } = req.query;

    const filter = { freelancer: req.user._id };
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'job',
          select: 'title category budgetType budgetMin budgetMax status location experienceLevel client',
          populate: { path: 'client', select: 'name email profilePic' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    res.json({
      success: true,
      pagination: buildPaginationMeta(total, page, limit),
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/applications/:id ────────────────────────────────────────────────
/**
 * Fetch a single application by ID.
 * Accessible by: the freelancer who submitted it OR the client who owns the job.
 */
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('freelancer', 'name email profilePic skills hourlyRate bio location portfolio')
      .populate({
        path: 'job',
        select: 'title category budgetType budgetMin budgetMax status client',
        populate: { path: 'client', select: 'name email profilePic' },
      });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const isOwnerFreelancer = application.freelancer._id.toString() === req.user._id.toString();
    const isJobClient = application.job.client._id.toString() === req.user._id.toString();

    if (!isOwnerFreelancer && !isJobClient) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to view this application.',
      });
    }

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/applications/:id/status ──────────────────────────────────────
/**
 * Client updates the status of an application.
 * Allowed transitions: pending → shortlisted | accepted | rejected
 *                      shortlisted → accepted | rejected
 * Body: { status, clientNote? }
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, clientNote } = req.body;

    const ALLOWED_STATUSES = ['shortlisted', 'accepted', 'rejected'];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`,
      });
    }

    const application = await Application.findById(req.params.id).populate('job', 'client status');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Only the client who owns the job may update status
    if (application.job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorised to update this application.',
      });
    }

    // Guard against editing already-closed applications
    if (application.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a withdrawn application.',
      });
    }

    application.status = status;
    if (clientNote !== undefined) application.clientNote = clientNote;

    // If a freelancer is accepted, optionally auto-move job to in_progress
    if (status === 'accepted' && application.job.status === 'open') {
      await application.job.updateOne({ status: 'in_progress' });
    }

    await application.save();

    await application.populate([
      { path: 'freelancer', select: 'name email profilePic' },
      { path: 'job', select: 'title status' },
    ]);

    res.json({ success: true, message: `Application ${status}.`, application });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/applications/:id/withdraw ────────────────────────────────────
/**
 * Freelancer withdraws their own application (only if pending or shortlisted).
 */
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications.',
      });
    }

    if (!['pending', 'shortlisted'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application with status "${application.status}".`,
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({ success: true, message: 'Application withdrawn successfully.' });
  } catch (error) {
    next(error);
  }
};
