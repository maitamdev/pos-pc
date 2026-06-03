const { body } = require('express-validator');

const createProductValidator = [
  body('sku').notEmpty().withMessage('SKU không được để trống'),
  body('name').notEmpty().withMessage('Tên sản phẩm không được để trống'),
  body('cost_price').isFloat({ min: 0 }).withMessage('Giá nhập không hợp lệ'),
  body('selling_price').isFloat({ min: 0 }).withMessage('Giá bán không hợp lệ'),
  body('selling_price').custom((value, { req }) => {
    if (parseFloat(value) < parseFloat(req.body.cost_price)) {
      throw new Error('Giá bán phải lớn hơn hoặc bằng giá nhập');
    }
    return true;
  }),
];

const updateProductValidator = [
  body('name').notEmpty().withMessage('Tên sản phẩm không được để trống'),
  body('cost_price').isFloat({ min: 0 }).withMessage('Giá nhập không hợp lệ'),
  body('selling_price').isFloat({ min: 0 }).withMessage('Giá bán không hợp lệ'),
  body('selling_price').custom((value, { req }) => {
    if (parseFloat(value) < parseFloat(req.body.cost_price)) {
      throw new Error('Giá bán phải lớn hơn hoặc bằng giá nhập');
    }
    return true;
  }),
];

module.exports = { createProductValidator, updateProductValidator };
