/**
 * Xác thực JWT
 * Middleware để verify JWT token và gán user vào request
 */

const { verifyAccessToken } = require('../utils/jwt');
const { createUnauthorizedError } = require('../utils/createError');

/**
 * Middleware xác thực JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateJWT = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json(createUnauthorizedError('Token không được cung cấp'));
    }

    // Kiểm tra format Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json(createUnauthorizedError('Format token không hợp lệ'));
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Gán thông tin user vào request
    req.user = decoded;
    req.token = token;
    
    next();
  } catch (error) {
    return res.status(401).json(createUnauthorizedError(error.message));
  }
};

/**
 * Middleware xác thực JWT tùy chọn (không bắt buộc)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(); // Tiếp tục mà không có user
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(); // Tiếp tục mà không có user
    }

    const token = parts[1];
    const decoded = verifyAccessToken(token);
    
    req.user = decoded;
    req.token = token;
    
    next();
  } catch (error) {
    // Bỏ qua lỗi và tiếp tục mà không có user
    next();
  }
};

/**
 * Middleware kiểm tra token có sắp hết hạn không
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkTokenExpiry = (req, res, next) => {
  try {
    const { isTokenExpiringSoon } = require('../utils/jwt');
    
    if (req.token && isTokenExpiringSoon(req.token)) {
      // Thêm header cảnh báo token sắp hết hạn
      res.set('X-Token-Expiring-Soon', 'true');
    }
    
    next();
  } catch (error) {
    next(); // Bỏ qua lỗi và tiếp tục
  }
};

/**
 * Middleware refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const refreshToken = (req, res, next) => {
  try {
    const { verifyRefreshToken, generateTokenPair } = require('../utils/jwt');
    
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    
    if (!refreshToken) {
      return res.status(401).json(createUnauthorizedError('Refresh token không được cung cấp'));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Tạo token mới
    const newTokens = generateTokenPair({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    
    // Gán token mới vào response
    res.locals.newTokens = newTokens;
    
    next();
  } catch (error) {
    return res.status(401).json(createUnauthorizedError('Refresh token không hợp lệ'));
  }
};

module.exports = {
  authenticateJWT,
  optionalAuth,
  checkTokenExpiry,
  refreshToken
};
