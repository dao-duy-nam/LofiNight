/**
 * Tạo error object chuẩn
 * Định nghĩa format lỗi thống nhất cho toàn bộ API
 */

/**
 * Tạo error object với format chuẩn
 * @param {string} message - Thông báo lỗi
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Loại lỗi
 * @param {any} details - Chi tiết lỗi (optional)
 * @returns {Object} Error object
 */
const createError = (message, statusCode = 500, error = 'InternalServerError', details = null) => {
  const errorObj = {
    success: false,
    message,
    error,
    statusCode,
    timestamp: new Date().toISOString(),
    path: process.env.NODE_ENV === 'development' ? new Error().stack : undefined
  };

  if (details) {
    errorObj.details = details;
  }

  return errorObj;
};

/**
 * Tạo lỗi validation
 * @param {string} message - Thông báo lỗi
 * @param {any} details - Chi tiết validation errors
 * @returns {Object} Validation error
 */
const createValidationError = (message = 'Dữ liệu không hợp lệ', details = null) => {
  return createError(message, 400, 'ValidationError', details);
};

/**
 * Tạo lỗi không tìm thấy
 * @param {string} message - Thông báo lỗi
 * @returns {Object} Not found error
 */
const createNotFoundError = (message = 'Không tìm thấy tài nguyên') => {
  return createError(message, 404, 'NotFoundError');
};

/**
 * Tạo lỗi không có quyền truy cập
 * @param {string} message - Thông báo lỗi
 * @returns {Object} Unauthorized error
 */
const createUnauthorizedError = (message = 'Không có quyền truy cập') => {
  return createError(message, 401, 'UnauthorizedError');
};

/**
 * Tạo lỗi bị cấm
 * @param {string} message - Thông báo lỗi
 * @returns {Object} Forbidden error
 */
const createForbiddenError = (message = 'Bị cấm truy cập') => {
  return createError(message, 403, 'ForbiddenError');
};

/**
 * Tạo lỗi xung đột
 * @param {string} message - Thông báo lỗi
 * @returns {Object} Conflict error
 */
const createConflictError = (message = 'Dữ liệu đã tồn tại') => {
  return createError(message, 409, 'ConflictError');
};

/**
 * Tạo lỗi server
 * @param {string} message - Thông báo lỗi
 * @param {any} details - Chi tiết lỗi
 * @returns {Object} Server error
 */
const createServerError = (message = 'Lỗi server', details = null) => {
  return createError(message, 500, 'InternalServerError', details);
};

/**
 * Tạo lỗi database
 * @param {string} message - Thông báo lỗi
 * @param {any} details - Chi tiết lỗi database
 * @returns {Object} Database error
 */
const createDatabaseError = (message = 'Lỗi database', details = null) => {
  return createError(message, 500, 'DatabaseError', details);
};

module.exports = {
  createError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError,
  createServerError,
  createDatabaseError
};
