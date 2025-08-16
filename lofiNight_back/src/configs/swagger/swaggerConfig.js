/**
 * Thông tin cấu hình swagger
 * Định nghĩa metadata cho API documentation
 */

const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lofi Night API',
      version: '1.0.0',
      description: 'API documentation cho ứng dụng Lofi Night - quản lý playlist và bài hát',
      contact: {
        name: 'Lofi Night Team',
        email: 'support@lofinight.com',
        url: 'https://lofinight.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.lofinight.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token để xác thực API'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Có lỗi xảy ra'
            },
            error: {
              type: 'string',
              example: 'ValidationError'
            },
            statusCode: {
              type: 'number',
              example: 400
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Thành công'
            },
            data: {
              type: 'object'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              example: 'johndoe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            fullName: {
              type: 'string',
              example: 'John Doe'
            },
            role: {
              type: 'string',
              enum: ['user', 'premium', 'moderator', 'admin'],
              example: 'user'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            isEmailVerified: {
              type: 'boolean',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Đăng nhập thành công'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Xác thực và đăng nhập'
      },
      {
        name: 'Users',
        description: 'Quản lý người dùng'
      },
      {
        name: 'Songs',
        description: 'Quản lý bài hát'
      },
      {
        name: 'Playlists',
        description: 'Quản lý playlist'
      }
    ]
  },
  apis: [
    './src/modules/*/routes/*.js',
    './src/modules/*/models/*.js',
    './src/modules/*/schemas/*.js',
    './src/modules/*/controllers/*.js',
    './src/modules/user/user.routes.js'
  ]
};

module.exports = swaggerConfig;
