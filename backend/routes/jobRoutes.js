/**
 * routes/jobRoutes.js — Job Posting Endpoints
 *
 * WHAT: Maps CRUD and search operations for job postings.
 * HOW:  Public GET routes accessible to all; POST/PUT/DELETE require auth + role guards.
 * WHY:  Express router lets us share the /api/jobs base path cleanly while
 *       applying different middleware chains per method.
 *
 * Endpoints:
 *   GET    /api/jobs/categories      — public; list of valid categories
 *   GET    /api/jobs/my-jobs         — protected (client); own job listings
 *   GET    /api/jobs                 — public; search/browse all open jobs
 *   POST   /api/jobs                 — protected (client); create job
 *   GET    /api/jobs/:id             — public; single job detail
 *   PUT    /api/jobs/:id             — protected (client); update own job
 *   DELETE /api/jobs/:id             — protected (client); soft-delete own job
 */

const express = require('express');
const { body } = require('express-validator');

const jobController = require('../controllers/jobController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// ─── Validator chains ────────────────────────────────────────────────────────
const createJobValidators = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 120 }).withMessage('Title must be 5–120 characters'),

  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be 20–5000 characters'),

  body('category').trim().notEmpty().withMessage('Category is required'),

  body('budgetType').notEmpty().withMessage('Budget type is required')
    .isIn(['fixed', 'hourly']).withMessage('Budget type must be "fixed" or "hourly"'),

  body('budgetMin').notEmpty().withMessage('Minimum budget is required')
    .isFloat({ min: 1 }).withMessage('Minimum budget must be at least $1'),

  body('budgetMax').notEmpty().withMessage('Maximum budget is required')
    .isFloat({ min: 1 }).withMessage('Maximum budget must be at least $1')
    .custom((val, { req }) => {
      if (Number(val) < Number(req.body.budgetMin)) {
        throw new Error('Maximum budget must be ≥ minimum budget');
      }
      return true;
    }),

  body('deadline').optional()
    .isISO8601().withMessage('Deadline must be a valid ISO 8601 date')
    .custom((val) => {
      if (new Date(val) <= new Date()) throw new Error('Deadline must be a future date');
      return true;
    }),

  body('location').optional()
    .isIn(['remote', 'onsite', 'hybrid']).withMessage('Location must be "remote", "onsite", or "hybrid"'),

  body('experienceLevel').optional()
    .isIn(['entry', 'intermediate', 'expert']).withMessage('Experience level must be "entry", "intermediate", or "expert"'),

  body('skills').optional().isArray().withMessage('Skills must be an array'),
];

const updateJobValidators = [
  body('title').optional().trim()
    .isLength({ min: 5, max: 120 }).withMessage('Title must be 5–120 characters'),

  body('description').optional().trim()
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be 20–5000 characters'),

  body('budgetType').optional()
    .isIn(['fixed', 'hourly']).withMessage('Budget type must be "fixed" or "hourly"'),

  body('budgetMin').optional()
    .isFloat({ min: 1 }).withMessage('Minimum budget must be at least $1'),

  body('budgetMax').optional()
    .isFloat({ min: 1 }).withMessage('Maximum budget must be at least $1'),

  body('status').optional()
    .isIn(['open', 'in_progress', 'cancelled']).withMessage('Invalid status'),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// Static sub-paths MUST come before /:id to avoid param collision
router.get('/categories', jobController.getJobCategories);
router.get('/my-jobs', protect, requireRole('client'), jobController.getMyJobs);

// Collection
router.get('/',  jobController.getAllJobs);
router.post('/', protect, requireRole('client'), createJobValidators, validate, jobController.createJob);

// Single resource
router.get('/:id',    jobController.getJobById);
router.put('/:id',    protect, requireRole('client'), updateJobValidators, validate, jobController.updateJob);
router.delete('/:id', protect, requireRole('client'), jobController.deleteJob);

module.exports = router;
