/**
 * Gửi email
 * Utility để gửi email sử dụng nodemailer
 */

const nodemailer = require('nodemailer');
const { ENV } = require('../configs/environments');

/**
 * Tạo transporter cho nodemailer
 * @returns {Object} Transporter object
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: ENV.EMAIL_PORT,
    secure: ENV.EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Gửi email đơn giản
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} text - Nội dung text
 * @param {string} html - Nội dung HTML (optional)
 * @returns {Promise} Kết quả gửi email
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Lofi Night" <${ENV.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email đã được gửi:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email đã được gửi thành công'
    };
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
    throw new Error('Không thể gửi email: ' + error.message);
  }
};

/**
 * Gửi email xác thực OTP
 * @param {string} to - Email người nhận
 * @param {string} otp - OTP code
 * @param {string} username - Tên người dùng
 * @returns {Promise} Kết quả gửi email
 */
const sendOTPEmail = async (to, otp, username = 'Người dùng') => {
  const subject = 'Xác thực OTP - Lofi Night';
  const text = `Xin chào ${username},\n\nMã OTP của bạn là: ${otp}\n\nMã này có hiệu lực trong 5 phút.\n\nTrân trọng,\nĐội ngũ Lofi Night`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Lofi Night</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Xin chào ${username},</h2>
        
        <p style="color: #666; font-size: 16px;">Mã OTP của bạn là:</p>
        
        <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        
        <p style="color: #666; font-size: 14px;">Mã này có hiệu lực trong 5 phút.</p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
        </p>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #fff; margin: 0;">© 2024 Lofi Night. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, text, html);
};

/**
 * Gửi email chào mừng
 * @param {string} to - Email người nhận
 * @param {string} username - Tên người dùng
 * @returns {Promise} Kết quả gửi email
 */
const sendWelcomeEmail = async (to, username) => {
  const subject = 'Chào mừng bạn đến với Lofi Night!';
  const text = `Xin chào ${username},\n\nChào mừng bạn đến với Lofi Night!\n\nChúng tôi rất vui mừng khi bạn tham gia cộng đồng âm nhạc của chúng tôi.\n\nTrân trọng,\nĐội ngũ Lofi Night`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Lofi Night</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Chào mừng bạn, ${username}!</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Chúng tôi rất vui mừng khi bạn tham gia cộng đồng âm nhạc của chúng tôi.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Tại Lofi Night, bạn có thể:
        </p>
        
        <ul style="color: #666; font-size: 16px; line-height: 1.6;">
          <li>Khám phá hàng nghìn bài hát lofi tuyệt vời</li>
          <li>Tạo playlist cá nhân của riêng bạn</li>
          <li>Chia sẻ âm nhạc với bạn bè</li>
          <li>Thưởng thức âm nhạc chất lượng cao</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://lofinight.com" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Bắt đầu khám phá
          </a>
        </div>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #fff; margin: 0;">© 2024 Lofi Night. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, text, html);
};

/**
 * Gửi email đặt lại mật khẩu
 * @param {string} to - Email người nhận
 * @param {string} resetToken - Token đặt lại mật khẩu
 * @param {string} username - Tên người dùng
 * @returns {Promise} Kết quả gửi email
 */
const sendPasswordResetEmail = async (to, resetToken, username) => {
  const resetUrl = `https://lofinight.com/reset-password?token=${resetToken}`;
  const subject = 'Đặt lại mật khẩu - Lofi Night';
  const text = `Xin chào ${username},\n\nBạn đã yêu cầu đặt lại mật khẩu.\n\nVui lòng click vào link sau để đặt lại mật khẩu:\n${resetUrl}\n\nLink này có hiệu lực trong 1 giờ.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ Lofi Night`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Lofi Night</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Xin chào ${username},</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Lofi Night của mình.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Link này có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #fff; margin: 0;">© 2024 Lofi Night. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, text, html);
};

/**
 * Gửi email thông báo
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} message - Nội dung thông báo
 * @param {string} username - Tên người dùng
 * @returns {Promise} Kết quả gửi email
 */
const sendNotificationEmail = async (to, subject, message, username) => {
  const text = `Xin chào ${username},\n\n${message}\n\nTrân trọng,\nĐội ngũ Lofi Night`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Lofi Night</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Xin chào ${username},</h2>
        
        <div style="background: #fff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
            ${message}
          </p>
        </div>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #fff; margin: 0;">© 2024 Lofi Night. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail(to, subject, text, html);
};

module.exports = {
  createTransporter,
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail
};
