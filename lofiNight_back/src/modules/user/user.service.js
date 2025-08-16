/**
 * Xử lý logic nghiệp vụ
 * Service layer cho User module - xử lý business logic
 */

const User = require('./user.model');
const { generateTokenPair } = require('../../utils/jwt');
const { generateEmailOTP, hashOTP } = require('../../utils/handleOTP');
const { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail } = require('../../utils/sendMail');
const { createError, createNotFoundError, createConflictError, createUnauthorizedError } = require('../../utils/createError');
const crypto = require('crypto');

class UserService {
  /**
   * Đăng ký người dùng mới
   */
  async register(userData) {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingEmail = await User.findByEmail(userData.email);
      if (existingEmail) {
        throw createConflictError('Email đã được sử dụng');
      }

      // Tạo người dùng mới
      const user = new User({
        username: userData.username.toLowerCase(),
        email: userData.email.toLowerCase(),
        password: userData.password,
        fullName: userData.fullName
      });

      await user.save();

      // Tạo token
      const tokenData = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const tokens = generateTokenPair(tokenData);

      // Gửi email chào mừng
      try {
        await sendWelcomeEmail(user.email, user.fullName);
      } catch (emailError) {
        console.error('Lỗi gửi email chào mừng:', emailError.message);
      }

      // Trả về thông tin người dùng (không có password)
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        message: 'Đăng ký thành công',
        data: {
          user: userResponse,
          tokens
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đăng nhập người dùng
   */
  async login(email, password) {
    try {
      // Tìm người dùng theo email và bao gồm password
      const user = await User.findByEmail(email).select('+password');
      if (!user) {
        throw createUnauthorizedError('Email hoặc mật khẩu không đúng');
      }

      // Kiểm tra tài khoản có bị khóa không
      if (user.isLocked) {
        throw createUnauthorizedError('Tài khoản đã bị khóa, vui lòng thử lại sau');
      }

      // Kiểm tra tài khoản có active không
      if (!user.isActive) {
        throw createUnauthorizedError('Tài khoản đã bị vô hiệu hóa');
      }

      // So sánh mật khẩu
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Tăng số lần thử đăng nhập
        await user.incrementLoginAttempts();
        throw createUnauthorizedError('Email hoặc mật khẩu không đúng');
      }

      // Reset số lần thử đăng nhập
      await user.resetLoginAttempts();

      // Cập nhật thời gian đăng nhập cuối
      await user.updateLastLogin();

      // Tạo token
      const tokenData = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const tokens = generateTokenPair(tokenData);

      // Trả về thông tin người dùng (không có password)
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: userResponse,
          tokens
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createNotFoundError('Không tìm thấy người dùng');
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thông tin cá nhân
   */
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createNotFoundError('Không tìm thấy người dùng');
      }

      // Cập nhật thông tin
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          user[key] = updateData[key];
        }
      });

      await user.save();

      return {
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thay đổi mật khẩu
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw createNotFoundError('Không tìm thấy người dùng');
      }

      // Kiểm tra mật khẩu hiện tại
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw createUnauthorizedError('Mật khẩu hiện tại không đúng');
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Thay đổi mật khẩu thành công'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Quên mật khẩu
   */
  async forgotPassword(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        // Không trả về lỗi để tránh leak thông tin
        return {
          success: true,
          message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu'
        };
      }

      // Tạo token reset password
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Lưu token vào database
      user.passwordResetToken = resetTokenHash;
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 giờ
      await user.save();

      // Gửi email reset password
      try {
        await sendPasswordResetEmail(user.email, resetToken, user.fullName);
      } catch (emailError) {
        console.error('Lỗi gửi email reset password:', emailError.message);
        throw createError('Không thể gửi email đặt lại mật khẩu');
      }

      return {
        success: true,
        message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(token, newPassword) {
    try {
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: resetTokenHash,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw createUnauthorizedError('Token không hợp lệ hoặc đã hết hạn');
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return {
        success: true,
        message: 'Đặt lại mật khẩu thành công'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gửi OTP xác thực email
   */
  async sendEmailOTP(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createNotFoundError('Không tìm thấy người dùng');
      }

      if (user.isEmailVerified) {
        throw createError('Email đã được xác thực');
      }

      // Tạo OTP
      const otpData = generateEmailOTP(user.email);
      const otpHash = hashOTP(otpData.otp);

      // Lưu OTP vào database
      user.emailVerificationToken = otpHash;
      user.emailVerificationExpires = new Date(otpData.expiresAt);
      await user.save();

      // Gửi email OTP
      try {
        await sendOTPEmail(user.email, otpData.otp, user.fullName);
      } catch (emailError) {
        console.error('Lỗi gửi email OTP:', emailError.message);
        throw createError('Không thể gửi email OTP');
      }

      return {
        success: true,
        message: 'Đã gửi mã OTP đến email của bạn'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xác thực email bằng OTP
   */
  async verifyEmailOTP(userId, otp) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createNotFoundError('Không tìm thấy người dùng');
      }

      if (user.isEmailVerified) {
        throw createError('Email đã được xác thực');
      }

      if (!user.emailVerificationToken || !user.emailVerificationExpires) {
        throw createUnauthorizedError('Mã OTP không hợp lệ');
      }

      if (user.emailVerificationExpires < new Date()) {
        throw createUnauthorizedError('Mã OTP đã hết hạn');
      }

      // Kiểm tra OTP
      const otpHash = hashOTP(otp);
      if (otpHash !== user.emailVerificationToken) {
        throw createUnauthorizedError('Mã OTP không đúng');
      }

      // Xác thực email
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return {
        success: true,
        message: 'Xác thực email thành công'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách người dùng (cho admin)
   */
  async getUsers(query) {
    try {
      const { page = 1, limit = 10, search, role, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      // Xây dựng filter
      const filter = {};
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive;

      // Xây dựng sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Thực hiện query
      const skip = (page - 1) * limit;
      const users = await User.find(filter)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(filter);

      return {
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái người dùng (cho admin)
   */
  async updateUserStatus(userId, isActive) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createNotFoundError('Không tìm thấy người dùng');
      }

      user.isActive = isActive;
      await user.save();

      return {
        success: true,
        message: `Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} người dùng`
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa người dùng (cho admin)
   */
  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createNotFoundError('Không tìm thấy người dùng');
      }

      await User.findByIdAndDelete(userId);

      return {
        success: true,
        message: 'Đã xóa người dùng'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
