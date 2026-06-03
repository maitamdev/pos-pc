const promotionService = require('../services/promotionService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const promotions = await promotionService.getAll();
    return success(res, promotions);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const result = await promotionService.create(req.body);
    return success(res, result, 'Tạo khuyến mãi thành công', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    await promotionService.update(req.params.id, req.body);
    return success(res, null, 'Cập nhật khuyến mãi thành công');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await promotionService.remove(req.params.id);
    return success(res, null, 'Xóa khuyến mãi thành công');
  } catch (err) { next(err); }
};

const validateCode = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const result = await promotionService.validate(code, subtotal);
    return success(res, result, 'Mã khuyến mãi hợp lệ');
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove, validateCode };
