/**
 * Gom toàn bộ config lại để import gọn
 * Export tất cả các cấu hình từ một nơi duy nhất
 */

// Import các config
const { ENV, PORT } = require('./environments');
const { connectDB, disconnectDB, connection } = require('./db');
const { swaggerMiddleware, swaggerSpec } = require('./swagger/swagger');

// Export tất cả config
module.exports = {
  // Environment config
  ENV,
  PORT,
  
  // Database config
  connectDB,
  disconnectDB,
  connection,
  
  // Swagger config
  swaggerMiddleware,
  swaggerSpec,
  
  // Helper function để khởi tạo tất cả config
  initializeConfigs: async () => {
    try {
      // Kết nối database
      await connectDB();
      
      console.log('✅ Tất cả config đã được khởi tạo thành công');
      return true;
    } catch (error) {
      console.error('❌ Lỗi khi khởi tạo config:', error.message);
      return false;
    }
  }
};
