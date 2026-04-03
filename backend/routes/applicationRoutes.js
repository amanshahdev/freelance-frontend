/**
 * routes/applicationRoutes.js — Application Lifecycle Endpoints
 *
 * WHAT: Routes for submitting and managing job applications.
 * HOW:  All routes are protected; role guards separate client vs. freelancer actions.
 * WHY:  Explicit role guards prevent clients from accidentally (or maliciously)
 *       applying to jobs, and prevent freelancers from changing application statuses.
 *
 * Endpoints:
 *   POST   /api/applications                        — freelancer; submit application
 *   GET    /api/applications/my-applications        — freelancer; own applications
 *   GET    /api/applications/job/:jobId             — client; applicants for a job
 *   GET    /api/applications/:id                    — client or owning freelancer
 *   PATCH  /api/applications/:id/status             — client; update status
 *   PATCH  /api/applications/:id/withdraw           — freelancer; withdraw application
 */

const express = require('express');
const { body } = require('express-validator');

const applicationController = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// ─── Validator chains ────────────────────────────────────────────────────────
const applyValidators = [
  body('jobId').notEmpty().withMessage('jobId is required')
    .isMongoId().withMessage('jobId must be a valid MongoDB ID'),

  body('coverLetter').trim().notEmpty().withMessage('Cover letter is required')
    .isLength({ min: 50, max: 3000 }).withMessage('Cover letter must be 50–3000 characters'),

  body('proposedRate').notEmpty().withMessage('Proposed rate is required')
    .isFloat({ min: 1 }).withMessage('Proposed rate must be at least $1'),

  body('estimatedDays').notEmpty().withMessage('Estimated days is required')
    .isInt({ min: 1, max: 365 }).withMessage('Estimated days must be between 1 and 365'),
];

const statusUpdateValidators = [
  body('status').notEmpty().withMessage('Status is required')
    .isIn(['shortlisted', 'accepted', 'rejected']).withMessage('Status must be "shortlisted", "accepted", or "rejected"'),

  body('clientNote').optional().trim()
    .isLength({ max: 500 }).withMessage('Client note cannot exceed 500 characters'),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// Freelancer routes
router.post('/', protect, requireRole('freelancer'), applyValidators, validate, applicationController.applyToJob);
router.get('/my-applications', protect, requireRole('freelancer'), applicationController.getMyApplications);
router.patch('/:id/withdraw', protect, requireRole('freelancer'), applicationController.withdrawApplication);

// Client routes
router.get('/job/:jobId', protect, requireRole('client'), applicationController.getJobApplications);
router.patch('/:id/status', protect, requireRole('client'), statusUpdateValidators, validate, applicationController.updateApplicationStatus);

// Shared (client OR owning freelancer)
router.get('/:id', protect, applicationController.getApplicationById);

module.exports = router;
