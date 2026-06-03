const customerService = require('../services/customerService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const customers = await customerService.getAll(req.query);
    return success(res, customers);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const customer = await customerService.getById(req.params.id);
    return success(res, customer);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const result = await customerService.create(req.body);
    return success(res, result, 'Tạo khách hàng thành công', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    await customerService.update(req.params.id, req.body);
    return success(res, null, 'Cập nhật khách hàng thành công');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await customerService.remove(req.params.id);
    return success(res, null, 'Xóa khách hàng thành công');
  } catch (err) { next(err); }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await customerService.getOrders(req.params.id);
    return success(res, orders);
  } catch (err) { next(err); }
};

const getLoyaltyHistory = async (req, res, next) => {
  try {
    const history = await customerService.getLoyaltyHistory(req.params.id);
    return success(res, history);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, getOrders, getLoyaltyHistory };
