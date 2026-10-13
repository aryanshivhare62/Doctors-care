const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generate JWT token
 * @param {string} userId
 * @param {string} role
 * @returns {string} signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Set HTTP-only JWT cookie and return sanitized user JSON
 * @param {Object} user - User document
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response
 * @param {string} message - Response message
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id, user.role);

  // Cookie expiration (default 7 days)
  const cookieExpiresMs = 7 * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresMs),
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('token', token, cookieOptions);

  // Sanitize user object (remove passwordHash if present)
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;

  return res.status(statusCode).json({
    success: true,
    message,
    token, // Also returned for clients that prefer Bearer Authorization header
    data: {
      user: userObj,
    },
  });
};

/**
 * Clear JWT cookie
 * @param {Object} res - Express response
 */
const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
};

module.exports = {
  generateToken,
  sendTokenResponse,
  clearTokenCookie,
};
