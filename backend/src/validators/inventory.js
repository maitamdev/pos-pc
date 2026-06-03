const { body } = require('express-validator');

const importStockValidator = [
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('ID sản phẩm không hợp lệ'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Số lượng nhập phải lớn hơn 0'),
];

const adjustStockValidator = [
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('ID sản phẩm không hợp lệ'),
  body('new_quantity')
    .isInt({ min: 0 })
    .withMessage('Số lượng mới không hợp lệ'),
];

module.exports = { importStockValidator, adjustStockValidator };