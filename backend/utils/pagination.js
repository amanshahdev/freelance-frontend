/**
 * utils/pagination.js — Pagination Helpers
 *
 * WHAT: Utility functions for consistent, cursor-free offset pagination.
 * HOW:  parsePaginationParams extracts page/limit from query strings with
 *       sane defaults. buildPaginationMeta wraps a result set with metadata
 *       that clients use to render pagination controls.
 * WHY:  Every listing endpoint needs pagination; centralising it avoids
 *       slightly different logic in each controller.
 */

/**
 * Parse pagination query params with sensible defaults and caps.
 *
 * @param {Object} query  — req.query
 * @returns {{ page, limit, skip }}
 */
const parsePaginationParams = (query = {}) => {
  const page  = Math.max(1, parseInt(query.page, 10)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a consistent pagination metadata object.
 *
 * @param {number} total  — total documents matching the query
 * @param {number} page   — current page
 * @param {number} limit  — page size
 * @returns {Object}
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { parsePaginationParams, buildPaginationMeta };
