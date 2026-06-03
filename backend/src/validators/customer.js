const { body } = require('express-validator');

const createCustomerValidator = [
  body('name').notEmpty().withMessage('Tên khách hàng không được để trống'),
];

const updateCustomerValidator = [
  body('name').notEmpty().withMessage('Tên khách hàng không được để trống'),
];

module.exports = { createCustomerValidator, updateCustomerValidator };