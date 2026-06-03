const inventoryService = require('../services/inventoryService');
const { success } = require('../utils/response');

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await inventoryService.getTransactions(req.query);
    return success(res, transactions);
  } catch (err) { next(err); }
};

const importStock = async (req, res, next) => {
  try {
    const { product_id, quantity, reference } = req.body;
    await inventoryService.importStock(product_id, quantity, reference, req.user.id);
    return success(res, null, 'Nhập kho thành công');
  } catch (err) { next(err); }
};

const adjustStock = async (req, res, next) => {
  try {
    const { product_id, new_quantity, reference } = req.body;
    await inventoryService.adjustStock(product_id, new_quantity, reference, req.user.id);
    return success(res, null, 'Điều chỉnh kho thành công');
  } catch (err) { next(err); }
};

const getLowStockAlerts = async (req, res, next) => {
  try {
    const alerts = await inventoryService.getLowStockAlerts();
    return success(res, alerts);
  } catch (err) { next(err); }
};

const resolveAlert = async (req, res, next) => {
  try {
    await inventoryService.resolveAlert(req.params.id);
    return success(res, null, 'Đã xử lý cảnh báo');
  } catch (err) { next(err); }
};

module.exports = { getTransactions, importStock, adjustStock, getLowStockAlerts, resolveAlert };
