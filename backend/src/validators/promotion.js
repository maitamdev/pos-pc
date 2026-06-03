const { body } = require('express-validator');

const createPromotionValidator = [
  body('code')
    .notEmpty()
    .withMessage('Mã khuyến mãi không được để trống')
    .isLength({ max: 50 })
    .withMessage('Mã khuyến mãi tối đa 50 ký tự'),
  body('discount_type')
    .isIn(['percent', 'fixed'])
    .withMessage('Loại giảm giá không hợp lệ'),
  body('discount_value')
    .isFloat({ min: 0.01 })
    .withMessage('Giá trị giảm giá phải lớn hơn 0'),
];

const updatePromotionValidator = [
  body('discount_type')
    .isIn(['percent', 'fixed'])
    .withMessage('Loại giảm giá không hợp lệ'),
  body('discount_value')
    .isFloat({ min: 0.01 })
    .withMessage('Giá trị giảm giá phải lớn hơn 0'),
];

const validatePromotionValidator = [
  body('code')
    .notEmpty()
    .withMessage('Mã khuyến mãi không được để trống'),
  body('subtotal')
    .isFloat({ min: 0 })
    .withMessage('Tổng tiền không hợp lệ'),
];

module.exports = { createPromotionValidator, updatePromotionValidator, validatePromotionValidator };