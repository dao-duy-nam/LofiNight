/**
 * Cấu hình môi trường - Đọc biến môi trường từ .env
 * Quản lý các cấu hình khác nhau cho development, production, testing
 */

require('dotenv').config();

const ENV = {
  // Cấu hình server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Cấu hình database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/lofi_night',
  
  // Cấu hình JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Cấu hình email
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  
  // Cấu hình upload file
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads/',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  
  // Cấu hình rate limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 phút
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  
  // Cấu hình CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Cấu hình logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Cấu hình OTP
  OTP_EXPIRES_IN: process.env.OTP_EXPIRES_IN || 5 * 60 * 1000, // 5 phút
  OTP_LENGTH: process.env.OTP_LENGTH || 6,
};

// Validate các biến môi trường bắt buộc
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && ENV.NODE_ENV === 'production') {
  console.error('❌ Thiếu các biến môi trường bắt buộc:', missingEnvVars);
  process.exit(1);
}

module.exports = { ENV, PORT: ENV.PORT };
