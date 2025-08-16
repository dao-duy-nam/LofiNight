/**
 * Xử lý request/response
 * Controller cho User module - xử lý HTTP requests và responses
 */

const userService = require('./user.service');
const { handleAsync } = require('../../utils/handleAsync');
class UserController {
  
  register = handleAsync(async (req, res) => {
    const result = await userService.register(req.body);
    res.status(201).json(result);
  });

  
  login = handleAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.status(200).json(result);
  });

 
  getProfile = handleAsync(async (req, res) => {
    const result = await userService.getUserById(req.user.userId);
    res.status(200).json(result);
  });

  
  updateProfile = handleAsync(async (req, res) => {
    const result = await userService.updateProfile(req.user.userId, req.body);
    res.status(200).json(result);
  });

  
  changePassword = handleAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user.userId, currentPassword, newPassword);
    res.status(200).json(result);
  });

  
  forgotPassword = handleAsync(async (req, res) => {
    const { email } = req.body;
    const result = await userService.forgotPassword(email);
    res.status(200).json(result);
  });

  
  resetPassword = handleAsync(async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await userService.resetPassword(token, newPassword);
    res.status(200).json(result);
  });

  
  sendEmailOTP = handleAsync(async (req, res) => {
    const result = await userService.sendEmailOTP(req.user.userId);
    res.status(200).json(result);
  });

 
  verifyEmailOTP = handleAsync(async (req, res) => {
    const { otp } = req.body;
    const result = await userService.verifyEmailOTP(req.user.userId, otp);
    res.status(200).json(result);
  });


  getUsers = handleAsync(async (req, res) => {
    const result = await userService.getUsers(req.query);
    res.status(200).json(result);
  });

    
  getUserById = handleAsync(async (req, res) => {
    const result = await userService.getUserById(req.params.userId);
    res.status(200).json(result);
  });


  updateUserStatus = handleAsync(async (req, res) => {
    const { isActive } = req.body;
    const result = await userService.updateUserStatus(req.params.userId, isActive);
    res.status(200).json(result);
  });

  
  deleteUser = handleAsync(async (req, res) => {
    const result = await userService.deleteUser(req.params.userId);
    res.status(200).json(result);
  });
}

module.exports = new UserController();
