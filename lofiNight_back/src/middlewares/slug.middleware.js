/**
 * Tạo slug SEO-friendly từ text
 * Middleware để tạo URL-friendly slug từ tiêu đề hoặc tên
 */

const slugify = require('slugify');

/**
 * Tạo slug từ text
 * @param {string} text - Text cần tạo slug
 * @param {Object} options - Tùy chọn cho slugify
 * @returns {string} Slug
 */
const createSlug = (text, options = {}) => {
  const defaultOptions = {
    lower: true,
    strict: true,
    locale: 'vi',
    remove: /[*+~.()'"!:@]/g,
    ...options
  };

  return slugify(text, defaultOptions);
};

/**
 * Middleware tạo slug từ field cụ thể
 * @param {string} sourceField - Field nguồn để tạo slug
 * @param {string} targetField - Field đích để lưu slug
 * @param {Object} options - Tùy chọn cho slugify
 * @returns {Function} Express middleware
 */
const generateSlug = (sourceField = 'title', targetField = 'slug', options = {}) => {
  return (req, res, next) => {
    try {
      if (req.body[sourceField]) {
        const sourceText = req.body[sourceField];
        const slug = createSlug(sourceText, options);
        
        // Gán slug vào body
        req.body[targetField] = slug;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware tạo slug với timestamp để tránh trùng lặp
 * @param {string} sourceField - Field nguồn để tạo slug
 * @param {string} targetField - Field đích để lưu slug
 * @param {Object} options - Tùy chọn cho slugify
 * @returns {Function} Express middleware
 */
const generateUniqueSlug = (sourceField = 'title', targetField = 'slug', options = {}) => {
  return (req, res, next) => {
    try {
      if (req.body[sourceField]) {
        const sourceText = req.body[sourceField];
        const timestamp = Date.now();
        const baseSlug = createSlug(sourceText, options);
        const uniqueSlug = `${baseSlug}-${timestamp}`;
        
        // Gán slug vào body
        req.body[targetField] = uniqueSlug;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware tạo slug với prefix
 * @param {string} sourceField - Field nguồn để tạo slug
 * @param {string} targetField - Field đích để lưu slug
 * @param {string} prefix - Prefix cho slug
 * @param {Object} options - Tùy chọn cho slugify
 * @returns {Function} Express middleware
 */
const generateSlugWithPrefix = (sourceField = 'title', targetField = 'slug', prefix = '', options = {}) => {
  return (req, res, next) => {
    try {
      if (req.body[sourceField]) {
        const sourceText = req.body[sourceField];
        const baseSlug = createSlug(sourceText, options);
        const slugWithPrefix = prefix ? `${prefix}-${baseSlug}` : baseSlug;
        
        // Gán slug vào body
        req.body[targetField] = slugWithPrefix;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware tạo slug từ nhiều field
 * @param {Array} fields - Array các field để tạo slug
 * @param {string} targetField - Field đích để lưu slug
 * @param {string} separator - Ký tự phân cách giữa các field
 * @param {Object} options - Tùy chọn cho slugify
 * @returns {Function} Express middleware
 */
const generateSlugFromMultipleFields = (fields = [], targetField = 'slug', separator = '-', options = {}) => {
  return (req, res, next) => {
    try {
      const fieldValues = fields
        .map(field => req.body[field])
        .filter(value => value && value.trim() !== '');
      
      if (fieldValues.length > 0) {
        const combinedText = fieldValues.join(` ${separator} `);
        const slug = createSlug(combinedText, options);
        
        // Gán slug vào body
        req.body[targetField] = slug;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware tạo slug với custom function
 * @param {Function} slugFunction - Function tùy chỉnh để tạo slug
 * @param {string} targetField - Field đích để lưu slug
 * @returns {Function} Express middleware
 */
const generateCustomSlug = (slugFunction, targetField = 'slug') => {
  return (req, res, next) => {
    try {
      const slug = slugFunction(req.body, req);
      
      if (slug) {
        req.body[targetField] = slug;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  createSlug,
  generateSlug,
  generateUniqueSlug,
  generateSlugWithPrefix,
  generateSlugFromMultipleFields,
  generateCustomSlug
};
