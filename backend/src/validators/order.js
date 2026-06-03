const { body } = require('express-validator');

const createOrderValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),
  body('items.*.product_id')
    .isInt({ min: 1 })
    .withMessage('ID sản phẩm không hợp lệ'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải lớn hơn 0'),
  body('payment_method')
    .optional()
    .isIn(['cash', 'banking', 'qr', 'card'])
    .withMessage('Phương thức thanh toán không hợp lệ'),
];

module.exports = { createOrderValidator };