const supplierService = require('../services/supplierService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const suppliers = await supplierService.getAll(req.query);
    return success(res, suppliers);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const supplier = await supplierService.getById(req.params.id);
    return success(res, supplier);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const result = await supplierService.create(req.body);
    return success(res, result, 'Tạo nhà cung cấp thành công', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    await supplierService.update(req.params.id, req.body);
    return success(res, null, 'Cập nhật nhà cung cấp thành công');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await supplierService.remove(req.params.id);
    return success(res, null, 'Xóa nhà cung cấp thành công');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
