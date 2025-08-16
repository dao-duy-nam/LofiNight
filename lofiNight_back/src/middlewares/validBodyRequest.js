/**
 * Validate request body bằng schema
 * Middleware để validate dữ liệu đầu vào sử dụng Joi schema
 */

const { createValidationError } = require('../utils/createError');

/**
 * Middleware validate request body
 * @param {Object} schema - Joi schema để validate
 * @param {string} source - Nguồn dữ liệu ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validBodyRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      
      if (!dataToValidate) {
        return res.status(400).json(createValidationError(`${source} không được cung cấp`));
      }

      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        return res.status(400).json(createValidationError('Dữ liệu không hợp lệ', details));
      }

      // Gán dữ liệu đã validate vào request
      req[source] = value;
      next();
    } catch (error) {
      return res.status(500).json(createValidationError('Lỗi validate dữ liệu'));
    }
  };
};

/**
 * Middleware validate request body
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => validBodyRequest(schema, 'body');

/**
 * Middleware validate request query
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => validBodyRequest(schema, 'query');

/**
 * Middleware validate request params
 * @param {Object} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validateParams = (schema) => validBodyRequest(schema, 'params');

/**
 * Middleware validate file upload
 * @param {Object} schema - Joi schema cho file
 * @returns {Function} Express middleware
 */
const validateFile = (schema) => {
  return (req, res, next) => {
    try {
      const files = req.files || req.file;
      
      if (!files) {
        return res.status(400).json(createValidationError('File không được cung cấp'));
      }

      const { error, value } = schema.validate(files, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        return res.status(400).json(createValidationError('File không hợp lệ', details));
      }

      req.validatedFiles = value;
      next();
    } catch (error) {
      return res.status(500).json(createValidationError('Lỗi validate file'));
    }
  };
};

/**
 * Middleware validate multiple sources cùng lúc
 * @param {Object} schemas - Object chứa các schema cho từng source
 * @returns {Function} Express middleware
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    try {
      const errors = [];

      // Validate từng source
      Object.keys(schemas).forEach(source => {
        const schema = schemas[source];
        const dataToValidate = req[source];

        if (dataToValidate) {
          const { error } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: false
          });

          if (error) {
            const details = error.details.map(detail => ({
              source,
              field: detail.path.join('.'),
              message: detail.message,
              value: detail.context?.value
            }));
            errors.push(...details);
          }
        }
      });

      if (errors.length > 0) {
        return res.status(400).json(createValidationError('Dữ liệu không hợp lệ', errors));
      }

      next();
    } catch (error) {
      return res.status(500).json(createValidationError('Lỗi validate dữ liệu'));
    }
  };
};

module.exports = {
  validBodyRequest,
  validateBody,
  validateQuery,
  validateParams,
  validateFile,
  validateMultiple
};
