/**
 * Tạo & verify token JWT
 * Quản lý authentication token cho API
 */

const jwt = require('jsonwebtoken');
const { ENV } = require('../configs/environments');

/**
 * Tạo access token
 * @param {Object} payload - Dữ liệu để encode vào token
 * @param {string} expiresIn - Thời gian hết hạn (default: 7d)
 * @returns {string} JWT token
 */
const generateAccessToken = (payload, expiresIn = ENV.JWT_EXPIRES_IN) => {
  try {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn,
      issuer: 'lofi-night-api',
      audience: 'lofi-night-users'
    });
  } catch (error) {
    throw new Error('Lỗi khi tạo access token: ' + error.message);
  }
};

/**
 * Tạo refresh token
 * @param {Object} payload - Dữ liệu để encode vào token
 * @param {string} expiresIn - Thời gian hết hạn (default: 30d)
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload, expiresIn = ENV.JWT_REFRESH_EXPIRES_IN) => {
  try {
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn,
      issuer: 'lofi-night-api',
      audience: 'lofi-night-users'
    });
  } catch (error) {
    throw new Error('Lỗi khi tạo refresh token: ' + error.message);
  }
};

/**
 * Tạo cả access token và refresh token
 * @param {Object} payload - Dữ liệu để encode vào token
 * @returns {Object} Object chứa access token và refresh token
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: ENV.JWT_EXPIRES_IN
  };
};

/**
 * Verify access token
 * @param {string} token - JWT token cần verify
 * @returns {Object} Decoded payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET, {
      issuer: 'lofi-night-api',
      audience: 'lofi-night-users'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token đã hết hạn');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token không hợp lệ');
    } else {
      throw new Error('Lỗi khi verify token: ' + error.message);
    }
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token cần verify
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET, {
      issuer: 'lofi-night-api',
      audience: 'lofi-night-users'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token đã hết hạn');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Refresh token không hợp lệ');
    } else {
      throw new Error('Lỗi khi verify refresh token: ' + error.message);
    }
  }
};

/**
 * Decode token mà không verify (chỉ để lấy thông tin)
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload (không đảm bảo tính hợp lệ)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Lỗi khi decode token: ' + error.message);
  }
};

/**
 * Kiểm tra token có sắp hết hạn không
 * @param {string} token - JWT token
 * @param {number} threshold - Số giây trước khi hết hạn để cảnh báo (default: 3600 = 1h)
 * @returns {boolean} True nếu token sắp hết hạn
 */
const isTokenExpiringSoon = (token, threshold = 3600) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return (decoded.exp - now) <= threshold;
  } catch (error) {
    return false;
  }
};

/**
 * Lấy thời gian còn lại của token
 * @param {string} token - JWT token
 * @returns {number} Số giây còn lại (0 nếu đã hết hạn)
 */
const getTokenTimeLeft = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - now);
  } catch (error) {
    return 0;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpiringSoon,
  getTokenTimeLeft
};
