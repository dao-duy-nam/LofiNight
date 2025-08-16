/**
 * Xác thực người dùng (role-based)
 * Middleware để kiểm tra quyền truy cập dựa trên role
 */

const { hasPermission, hasHigherRole, ROLES } = require('../constants/role.constant');
const { createForbiddenError, createUnauthorizedError } = require('../utils/createError');

/**
 * Middleware kiểm tra user đã đăng nhập chưa
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(createUnauthorizedError('Vui lòng đăng nhập để truy cập'));
  }
  next();
};

/**
 * Middleware kiểm tra role cụ thể
 * @param {...string} roles - Danh sách role được phép
 * @returns {Function} Express middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createUnauthorizedError('Vui lòng đăng nhập để truy cập'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(createForbiddenError('Bạn không có quyền truy cập tính năng này'));
    }

    next();
  };
};

/**
 * Middleware kiểm tra permission cụ thể
 * @param {string} permission - Permission cần kiểm tra
 * @returns {Function} Express middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createUnauthorizedError('Vui lòng đăng nhập để truy cập'));
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json(createForbiddenError('Bạn không có quyền thực hiện hành động này'));
    }

    next();
  };
};

/**
 * Middleware kiểm tra quyền sở hữu (owner hoặc admin)
 * @param {Function} getOwnerId - Function để lấy owner ID từ request
 * @returns {Function} Express middleware
 */
const requireOwnership = (getOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createUnauthorizedError('Vui lòng đăng nhập để truy cập'));
    }

    const ownerId = getOwnerId(req);
    
    // Admin có thể truy cập tất cả
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    // Kiểm tra quyền sở hữu
    if (req.user.userId !== ownerId) {
      return res.status(403).json(createForbiddenError('Bạn chỉ có thể truy cập tài nguyên của mình'));
    }

    next();
  };
};

/**
 * Middleware kiểm tra role cao hơn
 * @param {string} minRole - Role tối thiểu cần có
 * @returns {Function} Express middleware
 */
const requireHigherRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createUnauthorizedError('Vui lòng đăng nhập để truy cập'));
    }

    if (!hasHigherRole(req.user.role, minRole)) {
      return res.status(403).json(createForbiddenError('Bạn cần có quyền cao hơn để truy cập tính năng này'));
    }

    next();
  };
};

/**
 * Middleware kiểm tra user có phải là admin không
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
  return requireRole(ROLES.ADMIN)(req, res, next);
};

/**
 * Middleware kiểm tra user có phải là moderator hoặc admin không
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireModerator = (req, res, next) => {
  return requireRole(ROLES.MODERATOR, ROLES.ADMIN)(req, res, next);
};

/**
 * Middleware kiểm tra user có phải là premium hoặc cao hơn không
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requirePremium = (req, res, next) => {
  return requireRole(ROLES.PREMIUM, ROLES.MODERATOR, ROLES.ADMIN)(req, res, next);
};

/**
 * Middleware kiểm tra quyền truy cập tài nguyên
 * @param {string} resource - Loại tài nguyên (songs, playlists, users)
 * @param {string} action - Hành động (read, write, delete)
 * @returns {Function} Express middleware
 */
const requireResourceAccess = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createUnauthorizedError('Vui lòng đăng nhập để truy cập'));
    }

    const permission = `${action}:${resource}`;
    
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json(createForbiddenError(`Bạn không có quyền ${action} ${resource}`));
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
  requirePermission,
  requireOwnership,
  requireHigherRole,
  requireAdmin,
  requireModerator,
  requirePremium,
  requireResourceAccess
};
