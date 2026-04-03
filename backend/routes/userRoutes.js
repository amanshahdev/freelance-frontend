/**
 * routes/userRoutes.js — User / Profile Endpoints
 *
 * WHAT: Routes for reading and managing user profiles.
 * HOW:  Mix of public and protected routes; role guards applied where needed.
 * WHY:  Separating routes from controllers lets us change auth requirements
 *       for any endpoint without touching business logic.
 *
 * Endpoints:
 *   GET    /api/users/freelancers              — public; list freelancers
 *   GET    /api/users/clients                  — protected; list clients
 *   GET    /api/users/profile                  — protected; own full profile
 *   PUT    /api/users/profile                  — protected; update own profile
 *   DELETE /api/users/account                  — protected; deactivate own account
 *   POST   /api/users/portfolio                — protected (freelancer); add portfolio item
 *   DELETE /api/users/portfolio/:itemId        — protected (freelancer); remove portfolio item
 *   GET    /api/users/:id                      — public; fetch any user by ID
 *   GET    /api/users/:id/stats                — public; fetch user stats
 */

const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// ─── Validator chains ────────────────────────────────────────────────────────
const updateProfileValidators = [
  body('name').optional().trim()
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),

  body('bio').optional().trim()
    .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),

  body('skills').optional()
    .isArray({ max: 20 }).withMessage('Skills must be an array with max 20 items'),

  body('hourlyRate').optional()
    .isFloat({ min: 0, max: 10000 }).withMessage('Hourly rate must be between 0 and 10000'),

  body('location').optional().trim()
    .isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),

  body('profilePic').optional().trim()
    .isURL().withMessage('profilePic must be a valid URL'),
];

const portfolioValidators = [
  body('title').trim().notEmpty().withMessage('Portfolio item title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('url').trim().notEmpty().withMessage('Portfolio item URL is required')
    .isURL().withMessage('URL must be a valid URL'),
  body('description').optional().trim()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// Public listing routes (order matters — specific before :id)
router.get('/freelancers', userController.getAllFreelancers);
router.get('/clients', protect, userController.getAllClients);

// Own profile (protected)
router.get('/profile', protect, userController.getProfile.bind({ useCurrentUser: true }),
  // Workaround: wrap to use req.user._id as param
  (req, _res, next) => { req.params.id = req.user._id.toString(); next(); },
);

// Actually, define own-profile as a separate sub-route:
router.get('/me/profile', protect, async (req, res, next) => {
  req.params.id = req.user._id.toString();
  userController.getProfile(req, res, next);
});

router.put('/profile', protect, updateProfileValidators, validate, userController.updateProfile);
router.delete('/account', protect, userController.deleteAccount);

// Portfolio management (freelancer only)
router.post('/portfolio', protect, requireRole('freelancer'), portfolioValidators, validate, userController.addPortfolioItem);
router.delete('/portfolio/:itemId', protect, requireRole('freelancer'), userController.removePortfolioItem);

// Public user lookup (must come AFTER specific paths to avoid conflict)
router.get('/:id/stats', userController.getUserStats);
router.get('/:id', userController.getProfile);

module.exports = router;
