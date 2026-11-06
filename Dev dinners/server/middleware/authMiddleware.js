const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Restaurant = require('../models/Restaurant');
const Admin = require('../models/Admin');

/**
 * Protect Middleware
 * Validates the JWT Bearer token sent in Authorization headers.
 * Resolves the authenticated entity (Customer, Restaurant Owner, or Admin)
 * and attaches it to `req.user`.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'cravewise_msd_university_secret_key_2026'
      );

      // Resolve user model based on role in token payload
      if (decoded.role === 'customer') {
        req.user = await Customer.findById(decoded.id).select('-password');
      } else if (decoded.role === 'restaurant_owner') {
        req.user = await Restaurant.findById(decoded.id).select('-password');
      } else if (decoded.role === 'super_admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found or session expired. Please log in again.',
        });
      }

      next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token invalid or expired',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token provided',
    });
  }
};

/**
 * Optional Protect Middleware
 * If token is present, resolves user; otherwise lets request proceed anonymously.
 */
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'cravewise_msd_university_secret_key_2026'
      );
      if (decoded.role === 'customer') {
        req.user = await Customer.findById(decoded.id).select('-password');
      } else if (decoded.role === 'restaurant_owner') {
        req.user = await Restaurant.findById(decoded.id).select('-password');
      } else if (decoded.role === 'super_admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      }
    } catch {
      // Ignore token decode failure for optional auth
    }
  }
  next();
};

module.exports = { protect, optionalProtect };

