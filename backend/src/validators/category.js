const { body } = require('express-validator');

const createCategoryValidator = [
  body('name').notEmpty().withMessage('Tên danh mục không được để trống'),
];

const updateCategoryValidator = [
  body('name').notEmpty().withMessage('Tên danh mục không được để trống'),
];

module.exports = { createCategoryValidator, updateCategoryValidator };