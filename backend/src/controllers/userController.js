const userService = require('../services/userService');
const { success, error } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAll();
    return success(res, users);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    return success(res, user);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const result = await userService.create(req.body);
    return success(res, result, 'Tạo người dùng thành công', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    await userService.update(req.params.id, req.body);
    return success(res, null, 'Cập nhật người dùng thành công');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await userService.remove(req.params.id);
    return success(res, null, 'Xóa người dùng thành công');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
