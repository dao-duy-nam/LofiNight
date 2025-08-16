# Lofi Night Backend

Backend API cho ứng dụng Lofi Night - quản lý playlist và bài hát với Node.js, Express và MongoDB.

## 🚀 Tính năng

- **Authentication & Authorization**: JWT, Role-based access control
- **User Management**: Đăng ký, đăng nhập, quản lý profile
- **Email System**: Gửi email OTP, thông báo
- **File Upload**: Upload và quản lý file
- **API Documentation**: Swagger UI
- **Error Handling**: Xử lý lỗi toàn cục
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan logging
- **Database**: MongoDB với Mongoose

## 📋 Yêu cầu hệ thống

- Node.js (v16 trở lên)
- npm hoặc yarn
- MongoDB (local hoặc MongoDB Atlas)

## 🛠️ Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd lofiNight_back
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `env.example`:

```bash
cp env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster0.x0ichve.mongodb.net/lofi_night?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Setup database

Sử dụng script setup:

```bash
# Setup toàn bộ project
./db.bash setup

# Hoặc từng bước
./db.bash install
./db.bash sample
```

### 5. Khởi động ứng dụng

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📁 Cấu trúc dự án

```
lofiNight_back/
├── index.js                  # Entry point
├── package.json              # Dependencies & scripts
├── db.bash                   # Setup script
├── env.example               # Environment variables template
│
├── src/
│   ├── configs/              # Configuration files
│   │   ├── db.js             # MongoDB connection
│   │   ├── environments.js   # Environment variables
│   │   ├── swagger/          # API documentation
│   │   └── index.js          # Config exports
│   │
│   ├── constants/            # Constants
│   │   └── role.constant.js  # User roles
│   │
│   ├── modules/              # Feature modules
│   │   ├── user/             # User management
│   │   ├── song/             # Song management
│   │   └── playlist/         # Playlist management
│   │
│   ├── middlewares/          # Express middlewares
│   │   ├── errorHandler.js   # Global error handling
│   │   ├── authorize.js      # Authorization
│   │   ├── jwt.middleware.js # JWT authentication
│   │   └── ...
│   │
│   ├── utils/                # Utility functions
│   │   ├── createError.js    # Error creation
│   │   ├── jwt.js           # JWT utilities
│   │   ├── sendMail.js      # Email utilities
│   │   └── ...
│   │
│   ├── routes/               # Route definitions
│   │   └── index.js          # Route aggregation
│   │
│   └── app.js               # Express app setup
```

## 🔧 Scripts

```bash
# Development
npm run dev          # Chạy với nodemon

# Production
npm start           # Chạy production server

# Testing
npm test           # Chạy tests

# Database setup
./db.bash setup    # Setup toàn bộ project
./db.bash install  # Cài đặt dependencies
./db.bash sample   # Tạo dữ liệu mẫu
./db.bash dev      # Chạy development server
```

## 📚 API Documentation

Sau khi khởi động server, truy cập API documentation tại:

```
http://localhost:3000/api-docs
```

### Các endpoint chính:

#### Authentication
- `POST /api/users/register` - Đăng ký
- `POST /api/users/login` - Đăng nhập
- `POST /api/users/forgot-password` - Quên mật khẩu
- `POST /api/users/reset-password` - Đặt lại mật khẩu

#### User Management
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile
- `POST /api/users/change-password` - Thay đổi mật khẩu
- `POST /api/users/send-email-otp` - Gửi OTP
- `POST /api/users/verify-email-otp` - Xác thực email

#### Admin (Admin/Moderator only)
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:userId` - Lấy thông tin user
- `PATCH /api/users/:userId/status` - Cập nhật trạng thái user
- `DELETE /api/users/:userId` - Xóa user

## 🔐 Authentication

API sử dụng JWT Bearer token. Thêm header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **user**: Người dùng thông thường
- **premium**: Người dùng trả phí
- **moderator**: Điều hành viên
- **admin**: Quản trị viên

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs với salt rounds = 12
- **Rate Limiting**: Giới hạn request rate
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Mongoose ODM
- **XSS Protection**: Input sanitization

## 📧 Email System

Hệ thống email hỗ trợ:

- Email chào mừng
- OTP xác thực
- Đặt lại mật khẩu
- Thông báo

Cấu hình SMTP trong file `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🗄️ Database

### MongoDB Atlas Setup

1. Tạo cluster trên MongoDB Atlas
2. Tạo database user
3. Whitelist IP address
4. Lấy connection string
5. Cập nhật `MONGODB_URI` trong `.env`

### Collections

- **users**: Thông tin người dùng
- **songs**: Thông tin bài hát
- **playlists**: Thông tin playlist

## 🧪 Testing

```bash
# Chạy tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests trong watch mode
npm run test:watch
```

## 📦 Deployment

### Environment Variables

Đảm bảo cập nhật các biến môi trường cho production:

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://yourdomain.com
```

### PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start index.js --name "lofi-night-backend"

# Monitor
pm2 monit

# Logs
pm2 logs
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🆘 Support

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra [Issues](../../issues)
2. Tạo issue mới với thông tin chi tiết
3. Liên hệ team development

## 🔄 Changelog

### v1.0.0
- Initial release
- User authentication & authorization
- Email system
- API documentation
- Security features
