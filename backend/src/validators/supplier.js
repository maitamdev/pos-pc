const { body } = require('express-validator');

const createSupplierValidator = [
  body('name').notEmpty().withMessage('Tên nhà cung cấp không được để trống'),
];

const updateSupplierValidator = [
  body('name').notEmpty().withMessage('Tên nhà cung cấp không được để trống'),
];

module.exports = { createSupplierValidator, updateSupplierValidator };