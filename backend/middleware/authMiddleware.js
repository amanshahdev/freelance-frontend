/**
 * middleware/authMiddleware.js — JWT Verification & Role Guard
 *
 * WHAT: Express middleware that validates JWT tokens and optionally
 *       enforces role-based access control.
 * HOW:  Reads the Bearer token from the Authorization header, verifies
 *       it with the JWT_SECRET, then attaches the decoded user payload
 *       to req.user so downstream controllers can use it without hitting
 *       the database again (unless a full user document is required).
 * WHY:  Decoupling auth checks from business logic keeps controllers clean
 *       and allows role-gating to be applied declaratively in route files.
 *
 * Exports:
 *   protect        — verifies JWT; sets req.user
 *   requireRole    — factory that accepts ('client'|'freelancer'|'both')
 *   attachUser     — same as protect but does NOT block if token is absent
 *                    (used on public routes that show extra data when logged in)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: Extract token from header ──────────────────────────────────────
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

// ─── protect ────────────────────────────────────────────────────────────────
/**
 * Middleware that requires a valid JWT.
 * Attaches decoded payload to req.user and fetches a lean user doc
 * so controllers always have id, name, email, role, isActive available.
 */
const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch a lean user doc to confirm the account still exists and is active.
    // We use .select('-password') to avoid loading the hash unnecessarily.
    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user; // { _id, name, email, role, ... }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }
    next(error);
  }
};

// ─── requireRole ────────────────────────────────────────────────────────────
/**
 * Factory middleware that enforces role access.
 * Usage:
 *   router.post('/jobs', protect, requireRole('client'), createJob)
 *   router.get('/jobs', protect, requireRole(['client','freelancer']), getJobs)
 *
 * @param {string|string[]} roles — single role or array of allowed roles
 */
const requireRole = (roles) => (req, res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access restricted to: ${allowed.join(', ')}.`,
    });
  }
  next();
};

// ─── attachUser (optional auth) ─────────────────────────────────────────────
/**
 * Like protect, but does NOT reject unauthenticated requests.
 * Sets req.user if a valid token is present, otherwise req.user = null.
 * Useful for public endpoints that optionally personalise responses.
 */
const attachUser = async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();
    req.user = user && user.isActive ? user : null;
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { protect, requireRole, attachUser };
