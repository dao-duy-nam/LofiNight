/**
 * Xử lý lỗi toàn cục
 * Middleware để bắt và xử lý tất cả lỗi trong ứng dụng
 */

const { createError } = require('../utils/createError');

/**
 * Middleware xử lý lỗi toàn cục
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Tài nguyên không tồn tại';
    error = createError(message, 404, 'CastError');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} đã tồn tại`;
    error = createError(message, 409, 'DuplicateKeyError', {
      field,
      value: err.keyValue[field]
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Dữ liệu không hợp lệ';
    const details = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    error = createError(message, 400, 'ValidationError', details);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    error = createError(message, 401, 'JsonWebTokenError');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn';
    error = createError(message, 401, 'TokenExpiredError');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File quá lớn';
    error = createError(message, 400, 'FileSizeError');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Quá nhiều file';
    error = createError(message, 400, 'FileCountError');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'File không được hỗ trợ';
    error = createError(message, 400, 'FileTypeError');
  }

  // Rate limit errors
  if (err.status === 429) {
    const message = 'Quá nhiều request, vui lòng thử lại sau';
    error = createError(message, 429, 'RateLimitError');
  }

  // Network errors
  if (err.code === 'ECONNREFUSED') {
    const message = 'Không thể kết nối đến server';
    error = createError(message, 503, 'ConnectionError');
  }

  if (err.code === 'ETIMEDOUT') {
    const message = 'Request timeout';
    error = createError(message, 408, 'TimeoutError');
  }

  // Default error
  if (!error.statusCode) {
    error = createError(
      err.message || 'Lỗi server',
      err.statusCode || 500,
      err.name || 'InternalServerError'
    );
  }

  // Response error
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    error: error.error,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: error.details
    })
  });
};

/**
 * Middleware để bắt lỗi async/await
 * @param {Function} fn - Async function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware để log request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`${logLevel} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

module.exports = {
  errorHandler,
  asyncHandler,
  requestLogger
};
