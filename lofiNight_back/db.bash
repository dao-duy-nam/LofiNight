project/
├── index.js                  # File chạy chính của server (load app.js, lắng nghe cổng)
├── package.json              # Thông tin dự án + dependencies + scripts
├── package-lock.json         # Lock version dependencies
├── db.bash                   # Script bash để setup database hoặc import dữ liệu mẫu
│
├── src/
│   ├── constants/
│   │   └── role.constant.js      # Danh sách role
│   ├── configs/              # Cấu hình & khởi tạo app
│   │   ├── db.js             # Kết nối MongoDB (Mongoose)
│   │   ├── environments.js   # Đọc biến môi trường từ .env
│   │   ├── swagger/          # Cấu hình tài liệu API (Swagger UI)
│   │   │   ├── swagger.js            # Khởi tạo swagger
│   │   │   ├── swaggerConfig.js      # Thông tin cấu hình swagger
│   │   │   └── swaggerOutput.json    # File output docs
│   │   └── index.js          # Gom toàn bộ config lại để import gọn
│   │
│   ├── modules/              # Chia chức năng theo module (Module-based)
│   │   ├── user/              # Module quản lý user (ĐÃ HOÀN THÀNH)
│   │   │   ├── user.model.js        # Mongoose model (tương tác DB)
│   │   │   ├── user.schema.js       # Validate dữ liệu (Joi)
│   │   │   ├── user.controller.js   # Xử lý request/response
│   │   │   ├── user.service.js      # Xử lý logic nghiệp vụ
│   │   │   └── user.routes.js       # Định nghĩa API endpoint cho user
│   │   ├── song/              # Module quản lý bài hát (CHƯA HOÀN THÀNH)
│   │   │   ├── song.model.js        # Mongoose model (tương tác DB)
│   │   │   ├── song.schema.js       # Validate dữ liệu (Joi)
│   │   │   ├── song.controller.js   # Xử lý request/response
│   │   │   ├── song.service.js      # Xử lý logic nghiệp vụ
│   │   │   └── song.routes.js       # Định nghĩa API endpoint cho song
│   │   └── playlist/          # Module quản lý playlist (CHƯA HOÀN THÀNH)
│   │       ├── playlist.model.js    # Mongoose model (tương tác DB)
│   │       ├── playlist.schema.js   # Validate dữ liệu (Joi)
│   │       ├── playlist.controller.js # Xử lý request/response
│   │       ├── playlist.service.js  # Xử lý logic nghiệp vụ
│   │       └── playlist.routes.js   # Định nghĩa API endpoint cho playlist
│   │
│   ├── middlewares/          # Middleware dùng chung cho toàn app
│   │   ├── errorHandler.js        # Xử lý lỗi toàn cục
│   │   ├── authorize.js      # Xác thực người dùng (role-based)
│   │   ├── jsonInvalid.js         # Bắt lỗi JSON body sai format
│   │   ├── jwt.middleware.js      # Xác thực JWT
│   │   ├── notFoundHandler.js     # Xử lý route không tồn tại (404)
│   │   ├── validBodyRequest.js    # Validate request body bằng schema
│   │   ├── generateSku.js         # Tạo mã SKU tự động (nếu cần)
│   │   └── slug.middleware.js     # Tạo slug SEO-friendly từ text
│   │
│   ├── utils/                # Các hàm tiện ích (helper functions)
│   │   ├── createError.js         # Tạo error object chuẩn
│   │   ├── handleAsync.js         # Wrapper try/catch cho async
│   │   ├── handleOTP.js           # Tạo & xác thực OTP
│   │   ├── jwt.js                 # Tạo & verify token JWT
│   │   └── sendMail.js            # Gửi email
│   │
│   ├── routes/               # Gộp toàn bộ routes từ các module
│   │   └── index.js                # Import và mount tất cả module routes
│   │
│   └── app.js                # Khởi tạo Express app (middleware, routes, error handler)
