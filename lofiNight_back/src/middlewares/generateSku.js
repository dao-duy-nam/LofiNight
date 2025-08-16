/**
 * Tạo mã SKU tự động (nếu cần)
 * Middleware để tạo mã SKU (Stock Keeping Unit) tự động
 */

const crypto = require('crypto');

/**
 * Tạo SKU ngẫu nhiên
 * @param {number} length - Độ dài SKU (default: 8)
 * @param {string} prefix - Prefix cho SKU (optional)
 * @returns {string} SKU
 */
const generateSKU = (length = 8, prefix = '') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sku = '';
  
  for (let i = 0; i < length; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix ? `${prefix}-${sku}` : sku;
};

/**
 * Tạo SKU với timestamp
 * @param {string} prefix - Prefix cho SKU
 * @param {number} length - Độ dài phần ngẫu nhiên
 * @returns {string} SKU với timestamp
 */
const generateSKUWithTimestamp = (prefix = 'SKU', length = 6) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = generateSKU(length);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Tạo SKU từ thông tin sản phẩm
 * @param {string} category - Danh mục sản phẩm
 * @param {string} name - Tên sản phẩm
 * @param {number} length - Độ dài phần ngẫu nhiên
 * @returns {string} SKU có ý nghĩa
 */
const generateSKUFromInfo = (category, name, length = 4) => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const nameCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const random = generateSKU(length);
  return `${categoryCode}-${nameCode}-${random}`;
};

/**
 * Tạo SKU với hash
 * @param {string} data - Dữ liệu để hash
 * @param {number} length - Độ dài SKU
 * @returns {string} SKU từ hash
 */
const generateSKUFromHash = (data, length = 8) => {
  const hash = crypto.createHash('md5').update(data).digest('hex');
  return hash.substring(0, length).toUpperCase();
};

/**
 * Middleware tạo SKU tự động
 * @param {string} field - Field để lưu SKU
 * @param {Object} options - Tùy chọn tạo SKU
 * @returns {Function} Express middleware
 */
const generateSKUMiddleware = (field = 'sku', options = {}) => {
  return (req, res, next) => {
    try {
      if (!req.body[field]) {
        const { prefix, length, useTimestamp, useHash } = options;
        
        let sku;
        if (useHash && req.body.name) {
          sku = generateSKUFromHash(req.body.name, length);
        } else if (useTimestamp) {
          sku = generateSKUWithTimestamp(prefix, length);
        } else if (req.body.category && req.body.name) {
          sku = generateSKUFromInfo(req.body.category, req.body.name, length);
        } else {
          sku = generateSKU(length, prefix);
        }
        
        req.body[field] = sku;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware tạo SKU với validation
 * @param {string} field - Field để lưu SKU
 * @param {Function} validator - Function kiểm tra SKU đã tồn tại
 * @param {Object} options - Tùy chọn tạo SKU
 * @returns {Function} Express middleware
 */
const generateUniqueSKUMiddleware = (field = 'sku', validator, options = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.body[field]) {
        let sku;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = options.maxAttempts || 10;
        
        while (!isUnique && attempts < maxAttempts) {
          const { prefix, length, useTimestamp, useHash } = options;
          
          if (useHash && req.body.name) {
            sku = generateSKUFromHash(req.body.name + attempts, length);
          } else if (useTimestamp) {
            sku = generateSKUWithTimestamp(prefix, length);
          } else if (req.body.category && req.body.name) {
            sku = generateSKUFromInfo(req.body.category, req.body.name, length);
          } else {
            sku = generateSKU(length, prefix);
          }
          
          // Kiểm tra SKU có unique không
          if (validator) {
            isUnique = await validator(sku);
          } else {
            isUnique = true;
          }
          
          attempts++;
        }
        
        if (isUnique) {
          req.body[field] = sku;
        } else {
          throw new Error('Không thể tạo SKU unique sau nhiều lần thử');
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  generateSKU,
  generateSKUWithTimestamp,
  generateSKUFromInfo,
  generateSKUFromHash,
  generateSKUMiddleware,
  generateUniqueSKUMiddleware
};
