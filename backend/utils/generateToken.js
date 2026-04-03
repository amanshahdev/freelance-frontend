/**
 * utils/generateToken.js — JWT Generation Utility
 *
 * WHAT: Generates a signed JSON Web Token for a given user document.
 * HOW:  Embeds id, email, and role in the payload; signs with JWT_SECRET;
 *       expiry defaults to JWT_EXPIRES_IN env var (default 7 days).
 * WHY:  Extracting token generation to a utility avoids repeating the same
 *       jwt.sign() call in both the login and signup controllers.
 */

const jwt = require('jsonwebtoken');

/**
 * @param {Object} user  — Mongoose User document (or plain object with _id, email, role)
 * @returns {string}     — signed JWT string
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;
