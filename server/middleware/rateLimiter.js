const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Rate limiter for sensitive authentication endpoints (login, register)
 * Max 40 requests per 15 minutes window
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      'Too many authentication requests from this IP. Please try again after 15 minutes.'
    );
  },
});

/**
 * General API rate limiter
 * Max 200 requests per 15 minutes window
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 429, 'Too many requests. Please slow down and try again later.');
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
