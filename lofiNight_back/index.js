/**
 * File chạy chính của server
 * Load app.js và lắng nghe cổng được cấu hình
 */

const app = require('./src/app');
const { PORT } = require('./src/configs/environments');

// Khởi động server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Xử lý tắt server gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Nhận tín hiệu SIGTERM, đang tắt server...');
  server.close(() => {
    console.log('✅ Server đã tắt thành công');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Nhận tín hiệu SIGINT, đang tắt server...');
  server.close(() => {
    console.log('✅ Server đã tắt thành công');
    process.exit(0);
  });
});

// Xử lý lỗi không được handle
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});
