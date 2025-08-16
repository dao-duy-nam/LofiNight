/**
 * Cấu hình kết nối MongoDB (Mongoose)
 * Quản lý kết nối database, xử lý lỗi và reconnect
 */

const mongoose = require('mongoose');
const { ENV } = require('./environments');

// Cấu hình mongoose
mongoose.set('strictQuery', false);

// Tùy chọn kết nối
const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Số lượng connection tối đa trong pool
  serverSelectionTimeoutMS: 5000, // Timeout khi chọn server
  socketTimeoutMS: 45000, // Timeout cho socket operations
  // bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
};

/**
 * Kết nối đến MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, connectOptions);
    
    console.log(`✅ Kết nối MongoDB thành công: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 URI: ${ENV.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    
    return conn;
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Ngắt kết nối MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  } catch (error) {
    console.error('❌ Lỗi khi ngắt kết nối MongoDB:', error.message);
  }
};

// Xử lý sự kiện kết nối
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose đã kết nối thành công');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Lỗi kết nối Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose đã ngắt kết nối');
});

// Xử lý khi process bị tắt
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  disconnectDB,
  connection: mongoose.connection
};
