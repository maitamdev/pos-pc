const { body } = require('express-validator');

const createUserValidator = [
  body('username').notEmpty().withMessage('Tên đăng nhập không được để trống'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('full_name').notEmpty().withMessage('Họ tên không được để trống'),
  body('role_id').isInt({ min: 1 }).withMessage('Vai trò không hợp lệ'),
];

const updateUserValidator = [
  body('full_name').notEmpty().withMessage('Họ tên không được để trống'),
  body('role_id').isInt({ min: 1 }).withMessage('Vai trò không hợp lệ'),
];

module.exports = { createUserValidator, updateUserValidator };
