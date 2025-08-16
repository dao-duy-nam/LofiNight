/**
 * Tạo & xác thực OTP
 * Utility để quản lý One-Time Password cho xác thực
 */

const crypto = require('crypto');
const { ENV } = require('../configs/environments');

/**
 * Tạo OTP ngẫu nhiên
 * @param {number} length - Độ dài OTP (default: 6)
 * @returns {string} OTP
 */
const generateOTP = (length = ENV.OTP_LENGTH || 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

/**
 * Tạo OTP với timestamp
 * @param {number} length - Độ dài OTP
 * @returns {Object} Object chứa OTP và timestamp
 */
const generateOTPWithTimestamp = (length = ENV.OTP_LENGTH || 6) => {
  const otp = generateOTP(length);
  const timestamp = Date.now();
  
  return {
    otp,
    timestamp,
    expiresAt: timestamp + ENV.OTP_EXPIRES_IN
  };
};

/**
 * Kiểm tra OTP có hết hạn chưa
 * @param {number} timestamp - Timestamp khi tạo OTP
 * @param {number} expiresIn - Thời gian hết hạn (ms)
 * @returns {boolean} True nếu OTP đã hết hạn
 */
const isOTPExpired = (timestamp, expiresIn = ENV.OTP_EXPIRES_IN) => {
  const now = Date.now();
  return (now - timestamp) > expiresIn;
};

/**
 * Xác thực OTP
 * @param {string} inputOTP - OTP người dùng nhập
 * @param {string} storedOTP - OTP đã lưu
 * @param {number} timestamp - Timestamp khi tạo OTP
 * @param {number} expiresIn - Thời gian hết hạn (ms)
 * @returns {Object} Kết quả xác thực
 */
const verifyOTP = (inputOTP, storedOTP, timestamp, expiresIn = ENV.OTP_EXPIRES_IN) => {
  // Kiểm tra OTP có hết hạn chưa
  if (isOTPExpired(timestamp, expiresIn)) {
    return {
      isValid: false,
      message: 'OTP đã hết hạn',
      error: 'OTP_EXPIRED'
    };
  }

  // Kiểm tra OTP có đúng không
  if (inputOTP !== storedOTP) {
    return {
      isValid: false,
      message: 'OTP không đúng',
      error: 'OTP_INVALID'
    };
  }

  return {
    isValid: true,
    message: 'OTP hợp lệ'
  };
};

/**
 * Tạo OTP hash để lưu vào database
 * @param {string} otp - OTP gốc
 * @returns {string} OTP hash
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Xác thực OTP hash
 * @param {string} inputOTP - OTP người dùng nhập
 * @param {string} storedHash - OTP hash đã lưu
 * @param {number} timestamp - Timestamp khi tạo OTP
 * @param {number} expiresIn - Thời gian hết hạn (ms)
 * @returns {Object} Kết quả xác thực
 */
const verifyOTPHash = (inputOTP, storedHash, timestamp, expiresIn = ENV.OTP_EXPIRES_IN) => {
  // Kiểm tra OTP có hết hạn chưa
  if (isOTPExpired(timestamp, expiresIn)) {
    return {
      isValid: false,
      message: 'OTP đã hết hạn',
      error: 'OTP_EXPIRED'
    };
  }

  // Hash OTP input và so sánh
  const inputHash = hashOTP(inputOTP);
  
  if (inputHash !== storedHash) {
    return {
      isValid: false,
      message: 'OTP không đúng',
      error: 'OTP_INVALID'
    };
  }

  return {
    isValid: true,
    message: 'OTP hợp lệ'
  };
};

/**
 * Tạo OTP cho email
 * @param {string} email - Email người dùng
 * @param {number} length - Độ dài OTP
 * @returns {Object} Object chứa OTP và thông tin
 */
const generateEmailOTP = (email, length = ENV.OTP_LENGTH || 6) => {
  const otpData = generateOTPWithTimestamp(length);
  
  return {
    ...otpData,
    email,
    type: 'email'
  };
};

/**
 * Tạo OTP cho SMS
 * @param {string} phone - Số điện thoại
 * @param {number} length - Độ dài OTP
 * @returns {Object} Object chứa OTP và thông tin
 */
const generateSMSOTP = (phone, length = ENV.OTP_LENGTH || 6) => {
  const otpData = generateOTPWithTimestamp(length);
  
  return {
    ...otpData,
    phone,
    type: 'sms'
  };
};

/**
 * Format OTP để hiển thị (thêm dấu cách)
 * @param {string} otp - OTP gốc
 * @param {number} groupSize - Số ký tự mỗi nhóm (default: 3)
 * @returns {string} OTP đã format
 */
const formatOTP = (otp, groupSize = 3) => {
  return otp.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
};

/**
 * Tạo OTP với pattern cụ thể
 * @param {string} pattern - Pattern cho OTP (ví dụ: 'XXXX-XXXX')
 * @returns {string} OTP theo pattern
 */
const generatePatternOTP = (pattern = 'XXXX-XXXX') => {
  let otp = pattern;
  const digits = '0123456789';
  
  for (let i = 0; i < otp.length; i++) {
    if (otp[i] === 'X') {
      otp = otp.replace('X', digits[Math.floor(Math.random() * digits.length)]);
    }
  }
  
  return otp;
};

module.exports = {
  generateOTP,
  generateOTPWithTimestamp,
  isOTPExpired,
  verifyOTP,
  hashOTP,
  verifyOTPHash,
  generateEmailOTP,
  generateSMSOTP,
  formatOTP,
  generatePatternOTP
};
