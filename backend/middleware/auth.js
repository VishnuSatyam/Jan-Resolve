const { verifyAccessToken } = require('../utils/jwt');
const mongoose = require('mongoose');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const { findLocalUserById } = require('../utils/localUserStore');

const getBearerToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

const isMongoConnected = () => mongoose.connection.readyState === 1;

const findUserForRequest = async (id) => {
  if (isMongoConnected()) {
    return User.findById(id);
  }

  return findLocalUserById(id);
};

// Protect routes - require valid JWT
const protect = async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return next(new AppError('Access denied. Please log in.', 401));
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await findUserForRequest(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please log in again.', 401));
    }
    next(err);
  }
};

// Attach user when a valid token is present, but keep the route public.
const optionalAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user = await findUserForRequest(decoded.id);

    if (user?.isActive) {
      req.user = user;
    }

    next();
  } catch {
    next();
  }
};

// Restrict to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. Required role: ${roles.join(' or ')}.`, 403)
      );
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
