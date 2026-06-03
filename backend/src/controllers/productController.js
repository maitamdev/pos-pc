const productService = require('../services/productService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const products = await productService.getAll(req.query);
    return success(res, products);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    return success(res, product);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const result = await productService.create(req.body);
    return success(res, result, 'Tạo sản phẩm thành công', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    await productService.update(req.params.id, req.body);
    return success(res, null, 'Cập nhật sản phẩm thành công');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await productService.remove(req.params.id);
    return success(res, null, 'Xóa sản phẩm thành công');
  } catch (err) { next(err); }
};

const getLowStock = async (req, res, next) => {
  try {
    const products = await productService.getLowStock();
    return success(res, products);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, getLowStock };
