/**
 * Xử lý route không tồn tại (404)
 * Middleware để xử lý các request đến endpoint không tồn tại
 */

const { createNotFoundError } = require('../utils/createError');

/**
 * Middleware xử lý 404
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = createNotFoundError(`Route ${req.originalUrl} không tồn tại`);
  
  res.status(404).json({
    ...error,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

module.exports = notFoundHandler;
