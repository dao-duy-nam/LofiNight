/**
 * Mongoose model (tương tác DB)
 * Model User để quản lý thông tin người dùng
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../../constants/role.constant');

const userSchema = new mongoose.Schema({
  // Thông tin cơ bản
  username: {
    type: String,
    required: [true, 'Tên người dùng là bắt buộc'],
    trim: true,
    minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
    maxlength: [30, 'Tên người dùng không được quá 30 ký tự']
  },
  
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query
  },
  
  // Thông tin cá nhân
  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    maxlength: [100, 'Họ tên không được quá 100 ký tự']
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Giới thiệu không được quá 500 ký tự'],
    default: ''
  },
  
  // Thông tin liên hệ
  phone: {
    type: String,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
    default: null
  },
  
  // Vị trí
  location: {
    type: String,
    maxlength: [100, 'Địa chỉ không được quá 100 ký tự'],
    default: ''
  },
  
  // Quyền hạn
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER
  },
  
  // Trạng thái tài khoản
  isActive: {
    type: Boolean,
    default: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Thông tin đăng nhập
  lastLoginAt: {
    type: Date,
    default: null
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date,
    default: null
  },
  
  // Token và OTP
  emailVerificationToken: {
    type: String,
    default: null
  },
  
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  
  passwordResetToken: {
    type: String,
    default: null
  },
  
  passwordResetExpires: {
    type: Date,
    default: null
  },
  
  // Thống kê
  totalPlaylists: {
    type: Number,
    default: 0
  },
  
  totalSongs: {
    type: Number,
    default: 0
  },
  
  totalListenTime: {
    type: Number, // Tổng thời gian nghe nhạc (giây)
    default: 0
  },
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    
    language: {
      type: String,
      enum: ['vi', 'en'],
      default: 'vi'
    },
    
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual fields
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('displayName').get(function() {
  return this.fullName || this.username;
});

// Pre-save middleware - Hash password
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu nó được thay đổi
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password với salt rounds = 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Lỗi so sánh mật khẩu');
  }
};

userSchema.methods.incrementLoginAttempts = function() {
  // Nếu đã có lockUntil và đã hết hạn, reset về 0
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account nếu vượt quá 5 lần thử
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock 2 giờ
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Middleware để tự động cập nhật lastLoginAt
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
