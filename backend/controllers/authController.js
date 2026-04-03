/**
 * controllers/authController.js — Authentication Logic
 *
 * WHAT: Handles user registration, login, token refresh, and self-retrieval.
 * HOW:
 *   signup  — validates uniqueness, creates User doc (pre-save hook hashes pw),
 *             returns user + JWT.
 *   login   — finds user by email (with password selected), compares hash,
 *             returns user + JWT.
 *   getMe   — returns the currently authenticated user's full profile.
 *   changePassword — allows a logged-in user to change their own password.
 * WHY:  Separating auth logic from the route file makes unit testing and
 *       future OAuth integration straightforward.
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─── Helper: build safe user response ───────────────────────────────────────
const userResponse = (user) => ({
  _id:         user._id,
  name:        user.name,
  email:       user.email,
  role:        user.role,
  bio:         user.bio,
  skills:      user.skills,
  profilePic:  user.profilePic,
  location:    user.location,
  hourlyRate:  user.hourlyRate,
  portfolio:   user.portfolio,
  isActive:    user.isActive,
  createdAt:   user.createdAt,
  updatedAt:   user.updatedAt,
});

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
/**
 * Register a new user.
 * Body: { name, email, password, role }
 */
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for duplicate email before attempting save (gives friendlier error)
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user — password is hashed in the pre-save hook on User model
    const user = await User.create({ name, email, password, role });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
/**
 * Authenticate an existing user.
 * Body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // We must explicitly select password because it has select:false on the schema
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      // Use a generic message to prevent email enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
/**
 * Return the currently authenticated user's profile.
 * Protected: requires valid JWT (protect middleware sets req.user).
 */
exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware (lean doc, no password)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: userResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/auth/change-password ──────────────────────────────────────────
/**
 * Change password for the currently authenticated user.
 * Body: { currentPassword, newPassword }
 * Protected.
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(422).json({
        success: false,
        message: 'New password must be at least 8 characters.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
