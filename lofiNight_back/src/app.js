/**
 * Khởi tạo Express app (middleware, routes, error handler)
 * File chính để cấu hình Express application
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import configs
const { ENV, connectDB, swaggerMiddleware } = require('./configs');

// Import middlewares
const { errorHandler, requestLogger } = require('./middlewares/errorHandler');
const { authenticateJWT, checkTokenExpiry } = require('./middlewares/jwt.middleware');

// Import routes
const routes = require('./routes');

// Khởi tạo Express app
const app = express();

// Kết nối database
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Refresh-Token']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Quá nhiều request, vui lòng thử lại sau',
    error: 'RateLimitError',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

app.use('/api/', limiter);

// Logging middleware
if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server đang hoạt động bình thường',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: ENV.NODE_ENV,
    version: '1.0.0'
  });
});

// API Documentation
app.use('/api-docs', swaggerMiddleware);

// JWT middleware cho tất cả API routes
// app.use('/api', authenticateJWT, checkTokenExpiry);

// API routes
app.use('/api', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint không tồn tại',
    error: 'NotFoundError',
    statusCode: 404,
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler (phải đặt cuối cùng)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Nhận tín hiệu SIGTERM, đang tắt server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Nhận tín hiệu SIGINT, đang tắt server...');
  process.exit(0);
});

module.exports = app;
