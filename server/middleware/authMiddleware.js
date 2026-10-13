const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware to protect routes and verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check cookies first (primary method for httpOnly cookies)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization header as fallback for API clients / testing
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Authentication required. Please log in to access this resource.');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch user (excluding passwordHash)
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return errorResponse(res, 401, 'The account belonging to this token no longer exists.');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Your session has expired. Please log in again.');
    }
    return errorResponse(res, 401, 'Invalid authentication token.');
  }
};

/**
 * Middleware to restrict access based on user role
 * @param  {...string} roles - Permitted roles (e.g. 'admin', 'doctor', 'patient')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this route.`
      );
    }
    next();
  };
};

/**
 * Optional authentication middleware (does not reject unauthenticated users)
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Ignore token failure for optional auth
    }
  }
  next();
};

module.exports = {
  protect,
  authorizeRoles,
  optionalAuth,
};
