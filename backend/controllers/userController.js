/**
 * controllers/userController.js — User Profile Management
 *
 * WHAT: CRUD operations for user profiles (excluding auth — see authController).
 * HOW:
 *   getProfile        — public; returns any user's profile by ID
 *   updateProfile     — protected; user can update their own profile fields
 *   deleteAccount     — protected; soft-deletes (isActive = false) own account
 *   getAllFreelancers  — public; paginated + filterable list of freelancers
 *   getAllClients      — protected (admin-style); list all clients
 *   addPortfolioItem  — protected; append a portfolio entry
 *   removePortfolioItem — protected; remove a portfolio entry by sub-doc ID
 * WHY:  Separating user management from auth allows granular route protection
 *       and makes each concern independently testable.
 */

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { parsePaginationParams, buildPaginationMeta } = require('../utils/pagination');

// ─── GET /api/users/:id ──────────────────────────────────────────────────────
/**
 * Fetch any user's public profile by MongoDB ID.
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/users/profile ──────────────────────────────────────────────────
/**
 * Update the authenticated user's own profile.
 * Allowed fields: name, bio, skills, profilePic, location, hourlyRate
 * NOTE: email / password / role changes are NOT allowed here.
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const ALLOWED_FIELDS = ['name', 'bio', 'skills', 'profilePic', 'location', 'hourlyRate'];

    const updates = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/users/account ───────────────────────────────────────────────
/**
 * Soft-delete the authenticated user's account.
 * Sets isActive = false; does NOT hard-delete so referential integrity is preserved.
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'Account deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users/freelancers ──────────────────────────────────────────────
/**
 * Public endpoint: paginated, filterable list of active freelancers.
 * Query params:
 *   page, limit, search (text), skills, location, minRate, maxRate, sort
 */
exports.getAllFreelancers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { search, skills, location, minRate, maxRate, sort } = req.query;

    const filter = { role: 'freelancer', isActive: true };

    // Full-text search on name, bio, skills
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Filter by skills (comma-separated list)
    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillArray.length > 0) {
        filter.skills = { $in: skillArray };
      }
    }

    if (location && location.trim()) {
      filter.location = { $regex: location.trim(), $options: 'i' };
    }

    if (minRate !== undefined || maxRate !== undefined) {
      filter.hourlyRate = {};
      if (minRate !== undefined) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate !== undefined) filter.hourlyRate.$lte = Number(maxRate);
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'rate_asc') sortOption = { hourlyRate: 1 };
    if (sort === 'rate_desc') sortOption = { hourlyRate: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (search && search.trim()) sortOption = { score: { $meta: 'textScore' }, ...sortOption };

    const [freelancers, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      pagination: buildPaginationMeta(total, page, limit),
      freelancers,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users/clients — protected ─────────────────────────────────────
/**
 * Returns a paginated list of all active clients.
 */
exports.getAllClients = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const filter = { role: 'client', isActive: true };

    const [clients, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      pagination: buildPaginationMeta(total, page, limit),
      clients,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/users/portfolio ───────────────────────────────────────────────
/**
 * Add a portfolio item to the authenticated freelancer's profile.
 * Body: { title, url, description }
 */
exports.addPortfolioItem = async (req, res, next) => {
  try {
    const { title, url, description } = req.body;

    if (!title || !url) {
      return res.status(400).json({ success: false, message: 'title and url are required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.portfolio.length >= 10) {
      return res.status(400).json({ success: false, message: 'Portfolio limit is 10 items.' });
    }

    user.portfolio.push({ title, url, description: description || '' });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Portfolio item added.',
      portfolio: user.portfolio,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/users/portfolio/:itemId ─────────────────────────────────────
/**
 * Remove a portfolio item by its sub-document _id.
 */
exports.removePortfolioItem = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const itemIndex = user.portfolio.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Portfolio item not found.' });
    }

    user.portfolio.splice(itemIndex, 1);
    await user.save();

    res.json({ success: true, message: 'Portfolio item removed.', portfolio: user.portfolio });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users/:id/stats ─────────────────────────────────────────────────
/**
 * Return public stats for a user: jobs posted (client) or applications sent (freelancer).
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('role isActive');
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let stats = {};

    if (user.role === 'client') {
      const [totalJobs, openJobs, completedJobs] = await Promise.all([
        Job.countDocuments({ client: user._id, isActive: true }),
        Job.countDocuments({ client: user._id, status: 'open', isActive: true }),
        Job.countDocuments({ client: user._id, status: 'completed', isActive: true }),
      ]);
      stats = { totalJobs, openJobs, completedJobs };
    } else {
      const [totalApplications, acceptedApplications, pendingApplications] = await Promise.all([
        Application.countDocuments({ freelancer: user._id }),
        Application.countDocuments({ freelancer: user._id, status: 'accepted' }),
        Application.countDocuments({ freelancer: user._id, status: 'pending' }),
      ]);
      stats = { totalApplications, acceptedApplications, pendingApplications };
    }

    res.json({ success: true, role: user.role, stats });
  } catch (error) {
    next(error);
  }
};
