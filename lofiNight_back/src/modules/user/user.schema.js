/**
 * Validate dữ liệu (Joi)
 * Schema validation cho User module
 */

const Joi = require('joi');

// Schema cho đăng ký
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Tên người dùng chỉ được chứa chữ cái và số',
      'string.min': 'Tên người dùng phải có ít nhất 3 ký tự',
      'string.max': 'Tên người dùng không được quá 30 ký tự',
      'any.required': 'Tên người dùng là bắt buộc'
    }),
    
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
    
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      'any.required': 'Mật khẩu là bắt buộc'
    }),
    
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Mật khẩu xác nhận không khớp',
      'any.required': 'Mật khẩu xác nhận là bắt buộc'
    }),
    
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ tên không được quá 100 ký tự',
      'any.required': 'Họ tên là bắt buộc'
    })
});

// Schema cho đăng nhập
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
    
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Mật khẩu là bắt buộc'
    })
});

// Schema cho cập nhật thông tin cá nhân
const updateProfileSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ tên không được quá 100 ký tự'
    }),
    
  bio: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Giới thiệu không được quá 500 ký tự'
    }),
    
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ'
    }),
    
  location: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Địa chỉ không được quá 100 ký tự'
    }),
    
  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Avatar phải là URL hợp lệ'
    })
});

// Schema cho thay đổi mật khẩu
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Mật khẩu hiện tại là bắt buộc'
    }),
    
  newPassword: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      'any.required': 'Mật khẩu mới là bắt buộc'
    }),
    
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Mật khẩu xác nhận không khớp',
      'any.required': 'Mật khẩu xác nhận là bắt buộc'
    })
});

// Schema cho quên mật khẩu
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    })
});

// Schema cho đặt lại mật khẩu
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token là bắt buộc'
    }),
    
  newPassword: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
      'any.required': 'Mật khẩu mới là bắt buộc'
    }),
    
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Mật khẩu xác nhận không khớp',
      'any.required': 'Mật khẩu xác nhận là bắt buộc'
    })
});

// Schema cho xác thực email
const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token là bắt buộc'
    })
});

// Schema cho cập nhật preferences
const updatePreferencesSchema = Joi.object({
  theme: Joi.string()
    .valid('light', 'dark', 'auto')
    .optional()
    .messages({
      'any.only': 'Theme phải là light, dark hoặc auto'
    }),
    
  language: Joi.string()
    .valid('vi', 'en')
    .optional()
    .messages({
      'any.only': 'Ngôn ngữ phải là vi hoặc en'
    }),
    
  notifications: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional()
  }).optional()
});

// Schema cho query parameters
const querySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Trang phải là số',
      'number.integer': 'Trang phải là số nguyên',
      'number.min': 'Trang phải lớn hơn 0'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Giới hạn phải là số',
      'number.integer': 'Giới hạn phải là số nguyên',
      'number.min': 'Giới hạn phải lớn hơn 0',
      'number.max': 'Giới hạn không được quá 100'
    }),
    
  search: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Từ khóa tìm kiếm phải có ít nhất 1 ký tự',
      'string.max': 'Từ khóa tìm kiếm không được quá 50 ký tự'
    }),
    
  role: Joi.string()
    .valid('user', 'premium', 'moderator', 'admin')
    .optional()
    .messages({
      'any.only': 'Role không hợp lệ'
    }),
    
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Trạng thái phải là true hoặc false'
    }),
    
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'username', 'fullName', 'lastLoginAt')
    .default('createdAt')
    .messages({
      'any.only': 'Trường sắp xếp không hợp lệ'
    }),
    
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Thứ tự sắp xếp phải là asc hoặc desc'
    })
});

// Schema cho params
const paramsSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'ID người dùng không hợp lệ',
      'any.required': 'ID người dùng là bắt buộc'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  updatePreferencesSchema,
  querySchema,
  paramsSchema
};
