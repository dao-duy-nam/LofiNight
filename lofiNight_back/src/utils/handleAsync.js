/**
 * Wrapper try/catch cho async functions
 * Giúp xử lý lỗi một cách nhất quán trong các async function
 */

/**
 * Wrapper cho async function để tự động xử lý lỗi
 * @param {Function} fn - Async function cần wrap
 * @returns {Function} Express middleware function
 */
const handleAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Wrapper cho async function với custom error handler
 * @param {Function} fn - Async function cần wrap
 * @param {Function} errorHandler - Custom error handler function
 * @returns {Function} Express middleware function
 */
const handleAsyncWithCustomError = (fn, errorHandler) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch((error) => {
        if (errorHandler) {
          errorHandler(error, req, res, next);
        } else {
          next(error);
        }
      });
  };
};

/**
 * Wrapper cho async function với validation
 * @param {Function} fn - Async function cần wrap
 * @param {Function} validator - Validation function
 * @returns {Function} Express middleware function
 */
const handleAsyncWithValidation = (fn, validator) => {
  return (req, res, next) => {
    try {
      // Validate trước khi chạy function
      if (validator) {
        const validationResult = validator(req);
        if (validationResult && validationResult.error) {
          return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            error: 'ValidationError',
            details: validationResult.error.details
          });
        }
      }
      
      // Chạy function chính
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Wrapper cho async function với timeout
 * @param {Function} fn - Async function cần wrap
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Function} Express middleware function
 */
const handleAsyncWithTimeout = (fn, timeout = 30000) => {
  return (req, res, next) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeout);
    });

    Promise.race([
      Promise.resolve(fn(req, res, next)),
      timeoutPromise
    ]).catch(next);
  };
};

/**
 * Wrapper cho async function với retry logic
 * @param {Function} fn - Async function cần wrap
 * @param {number} maxRetries - Số lần retry tối đa
 * @param {number} delay - Delay giữa các lần retry (ms)
 * @returns {Function} Express middleware function
 */
const handleAsyncWithRetry = (fn, maxRetries = 3, delay = 1000) => {
  return async (req, res, next) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await Promise.resolve(fn(req, res, next));
        return; // Thành công, thoát khỏi retry loop
      } catch (error) {
        lastError = error;
        
        // Nếu là lần cuối hoặc lỗi không phải network/database, không retry
        if (attempt === maxRetries || 
            (error.code && !['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code))) {
          break;
        }
        
        // Delay trước khi retry
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    next(lastError);
  };
};

module.exports = {
  handleAsync,
  handleAsyncWithCustomError,
  handleAsyncWithValidation,
  handleAsyncWithTimeout,
  handleAsyncWithRetry
};
