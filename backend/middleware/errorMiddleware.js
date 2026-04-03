/**
 * middleware/errorMiddleware.js — Global Error Handlers
 *
 * WHAT: Two Express error-handling middleware functions:
 *         1. notFound  — catches requests to undefined routes (404)
 *         2. errorHandler — catches all errors thrown or passed to next()
 * HOW:  notFound creates an Error and forwards to errorHandler.
 *       errorHandler normalises Mongoose errors, JWT errors, and generic
 *       JS errors into consistent JSON responses.
 * WHY:  Without centralised error handling, each controller would need its
 *       own try-catch with repetitive formatting logic. This keeps responses
 *       uniform and debugging painless.
 */

// ─── 404 Handler ─────────────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must have 4 parameters so Express recognises it as an error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Mongoose: CastError (invalid ObjectId) ──────────────────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // ── Mongoose: ValidationError ───────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose: Duplicate key (E11000) ────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value: "${value}" is already in use for ${field}.`;
  }

  // ── JWT errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // ── Log in development ───────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${statusCode} — ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
