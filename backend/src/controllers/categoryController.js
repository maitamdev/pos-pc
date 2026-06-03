const categoryService = require('../services/categoryService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll();
    return success(res, categories);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const result = await categoryService.create(req.body);
    return success(res, result, 'Tạo danh mục thành công', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    await categoryService.update(req.params.id, req.body);
    return success(res, null, 'Cập nhật danh mục thành công');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await categoryService.remove(req.params.id);
    return success(res, null, 'Xóa danh mục thành công');
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
