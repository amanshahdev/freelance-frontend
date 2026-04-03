/**
 * middleware/validate.js — Request Validation Middleware
 *
 * WHAT: A thin wrapper around express-validator's validationResult.
 *       Call this AFTER a chain of check() / body() validators in a route.
 * HOW:  Collects all validation errors from the request and, if any exist,
 *       returns a 422 JSON response without proceeding to the controller.
 * WHY:  Keeps controllers focused on business logic; all input sanitation
 *       lives in validator chains, not scattered if-statements.
 *
 * Usage in routes:
 *   router.post('/signup', signupValidators, validate, authController.signup);
 */

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
  }));

  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
};

module.exports = validate;
