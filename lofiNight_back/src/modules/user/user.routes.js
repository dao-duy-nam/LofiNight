/**
 * Định nghĩa API endpoint cho user
 * Routes cho User module
 */

const express = require('express');
const router = express.Router();

// Import controller và middleware
const userController = require('./user.controller');
const { validateBody, validateParams, validateQuery } = require('../../middlewares/validBodyRequest');
const { requireAuth, requireAdmin, requireModerator } = require('../../middlewares/authorize');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  querySchema,
  paramsSchema
} = require('./user.schema');

// ========================================
// AUTH ROUTES (Không cần authentication)
// ========================================

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản mới
 *     description: Tạo tài khoản người dùng mới với thông tin cơ bản
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, fullName]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateBody(registerSchema), userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     description: Xác thực người dùng và trả về token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Thông tin đăng nhập không đúng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateBody(loginSchema), userController.login);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Quên mật khẩu
 *     description: Gửi email reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Email đã được gửi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Email không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', validateBody(forgotPasswordSchema), userController.forgotPassword);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Đặt lại mật khẩu
 *     description: Đặt lại mật khẩu bằng token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "reset_token_here"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Token không hợp lệ hoặc hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-password', validateBody(resetPasswordSchema), userController.resetPassword);

// ========================================
// USER ROUTES (Cần authentication)
// ========================================


/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Lấy thông tin profile
 *     description: Lấy thông tin profile của user hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', requireAuth, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Cập nhật profile
 *     description: Cập nhật thông tin profile của user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "+84123456789"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile', requireAuth, validateBody(updateProfileSchema), userController.updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Thay đổi mật khẩu
 *     description: Thay đổi mật khẩu của user hiện tại
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Thay đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Mật khẩu hiện tại không đúng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/change-password', requireAuth, validateBody(changePasswordSchema), userController.changePassword);

/**
 * @swagger
 * /api/users/send-email-otp:
 *   post:
 *     tags: [Users]
 *     summary: Gửi OTP xác thực email
 *     description: Gửi mã OTP để xác thực email
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP đã được gửi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/send-email-otp', requireAuth, userController.sendEmailOTP);

/**
 * @swagger
 * /api/users/verify-email-otp:
 *   post:
 *     tags: [Users]
 *     summary: Xác thực email bằng OTP
 *     description: Xác thực email bằng mã OTP đã gửi
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: OTP không đúng hoặc hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify-email-otp', requireAuth, validateBody(verifyEmailSchema), userController.verifyEmailOTP);

// ========================================
// ADMIN ROUTES (Chỉ admin/moderator)
// ========================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Lấy danh sách người dùng (Admin/Moderator)
 *     description: Lấy danh sách tất cả người dùng với phân trang
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng item mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên hoặc email
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', requireModerator, validateQuery(querySchema), userController.getUsers);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Lấy thông tin người dùng theo ID
 *     description: Lấy thông tin chi tiết của một người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:userId', requireModerator, validateParams(paramsSchema), userController.getUserById);

/**
 * @swagger
 * /api/users/{userId}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Cập nhật trạng thái người dùng (Admin)
 *     description: Kích hoạt hoặc vô hiệu hóa tài khoản người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:userId/status', requireAdmin, validateParams(paramsSchema), userController.updateUserStatus);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Xóa người dùng (Admin)
 *     description: Xóa vĩnh viễn tài khoản người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:userId', requireAdmin, validateParams(paramsSchema), userController.deleteUser);

module.exports = router;
