/**
 * Bắt lỗi JSON body sai format
 * Middleware để xử lý lỗi khi parse JSON body
 */

const { createValidationError } = require('../utils/createError');

/**
 * Middleware bắt lỗi JSON không hợp lệ
 * @param {Error} err - Error object từ express.json()
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const jsonInvalid = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(createValidationError('JSON không hợp lệ'));
  }
  next();
};

/**
 * Middleware kiểm tra Content-Type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json(createValidationError('Content-Type phải là application/json'));
    }
  }
  next();
};

/**
 * Middleware kiểm tra body không rỗng
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkBodyNotEmpty = (req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && 
      (!req.body || Object.keys(req.body).length === 0)) {
    return res.status(400).json(createValidationError('Request body không được để trống'));
  }
  next();
};

module.exports = {
  jsonInvalid,
  checkContentType,
  checkBodyNotEmpty
};
