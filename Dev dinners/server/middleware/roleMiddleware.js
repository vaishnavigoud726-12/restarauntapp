/**
 * Role-Based Access Control (RBAC) Middleware
 * Ensures only users with the permitted role(s) can access protected routes.
 * Examples: authorize('restaurant_owner'), authorize('super_admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { authorize };

