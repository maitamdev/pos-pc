const orderService = require('../services/orderService');
const { success } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const order = await orderService.create(req.body, req.user.id);
    return success(res, order, 'Tạo hóa đơn thành công', 201);
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const orders = await orderService.getAll(req.query, req.user.id, req.user.role);
    return success(res, orders);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const order = await orderService.getById(req.params.id, req.user.id, req.user.role);
    return success(res, order);
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    await orderService.cancel(req.params.id, req.user.id, req.user.role);
    return success(res, null, 'Hủy hóa đơn thành công');
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getById, cancel };
