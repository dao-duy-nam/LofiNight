/**
 * Khởi tạo swagger
 * Tạo API documentation từ các route và schema
 */

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./swaggerConfig");

// Tạo swagger spec từ config
const swaggerSpec = swaggerJsdoc(swaggerConfig);

/**
 * Middleware để serve Swagger UI
 */
const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: "🎵 Lofi Night API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    docExpansion: "full",
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true,
    displayRequestDuration: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    requestInterceptor: (req) => {
      // Thêm token vào header nếu có
      const token = localStorage.getItem("token");
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      return req;
    },
  },
};

/**
 * Tạo swagger middleware
 */
const swaggerMiddleware = [
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions),
];

/**
 * Lưu swagger spec ra file JSON (cho việc export)
 */
const saveSwaggerSpec = () => {
  const fs = require("fs");
  const path = require("path");

  const outputPath = path.join(__dirname, "swaggerOutput.json");

  try {
    fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
    console.log("✅ Đã lưu Swagger spec vào:", outputPath);
  } catch (error) {
    console.error("❌ Lỗi khi lưu Swagger spec:", error.message);
  }
};

// Lưu spec khi khởi tạo (chỉ trong development và chỉ khi chưa có file)
if (process.env.NODE_ENV === "development") {
  const fs = require("fs");
  const path = require("path");
  const outputPath = path.join(__dirname, "swaggerOutput.json");

  // Chỉ lưu nếu file chưa tồn tại để tránh vòng lặp
  if (!fs.existsSync(outputPath)) {
    saveSwaggerSpec();
  }
}

module.exports = {
  swaggerMiddleware,
  swaggerSpec,
  saveSwaggerSpec,
};
