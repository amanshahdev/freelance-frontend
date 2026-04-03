/**
 * routes/authRoutes.js — Authentication Endpoints
 *
 * WHAT: Maps HTTP verbs + paths to auth controller functions, with
 *       express-validator chains before each mutation endpoint.
 * HOW:  Each route calls: [validators] → validate middleware → controller.
 * WHY:  Declarative validator chains here keep the controller free of
 *       repetitive input-checking code.
 *
 * Endpoints:
 *   POST   /api/auth/signup           — register
 *   POST   /api/auth/login            — login
 *   GET    /api/auth/me               — get own profile (protected)
 *   PUT    /api/auth/change-password  — change password (protected)
 */

const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// ─── Validator chains ────────────────────────────────────────────────────────
const signupValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['client', 'freelancer']).withMessage('Role must be "client" or "freelancer"'),
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('currentPassword is required'),
  body('newPassword')
    .notEmpty().withMessage('newPassword is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number'),
];

// ─── Routes ──────────────────────────────────────────────────────────────────
router.post('/signup', signupValidators, validate, authController.signup);
router.post('/login',  loginValidators,  validate, authController.login);
router.get('/me',      protect,                    authController.getMe);
router.put('/change-password', protect, changePasswordValidators, validate, authController.changePassword);

module.exports = router;
