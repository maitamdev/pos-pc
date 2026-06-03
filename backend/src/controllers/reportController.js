const reportService = require('../services/reportService');
const { success } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const data = await reportService.getDashboard();
    return success(res, data);
  } catch (err) { next(err); }
};

const getRevenue = async (req, res, next) => {
  try {
    const data = await reportService.getRevenue(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const getTopProducts = async (req, res, next) => {
  try {
    const data = await reportService.getTopProducts(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const getLowStock = async (req, res, next) => {
  try {
    const data = await reportService.getLowStockReport();
    return success(res, data);
  } catch (err) { next(err); }
};

const getEmployeeRevenue = async (req, res, next) => {
  try {
    const data = await reportService.getEmployeeRevenue(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const getCategoryRevenue = async (req, res, next) => {
  try {
    const data = await reportService.getCategoryRevenue(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const getProfit = async (req, res, next) => {
  try {
    const data = await reportService.getProfitReport(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const getExportData = async (req, res, next) => {
  try {
    const data = await reportService.getExportData(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const getRFM = async (req, res, next) => {
  try {
    const data = await reportService.getRFMAnalysis();
    return success(res, data);
  } catch (err) { next(err); }
};

const getInventoryAging = async (req, res, next) => {
  try {
    const data = await reportService.getInventoryAging();
    return success(res, data);
  } catch (err) { next(err); }
};

const getPaymentMethods = async (req, res, next) => {
  try {
    const data = await reportService.getPaymentMethodReport(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

module.exports = { getDashboard, getRevenue, getTopProducts, getLowStock, getEmployeeRevenue, getCategoryRevenue, getProfit, getExportData, getRFM, getInventoryAging, getPaymentMethods };
