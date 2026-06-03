const { body } = require('express-validator');

const loginValidator = [
  body('username').notEmpty().withMessage('Tên đăng nhập không được để trống'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
];

module.exports = { loginValidator, changePasswordValidator };
