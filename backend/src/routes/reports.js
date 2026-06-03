const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/dashboard', authorize('admin', 'manager'), ctrl.getDashboard);
router.get('/revenue', authorize('admin', 'manager'), ctrl.getRevenue);
router.get('/top-products', authorize('admin', 'manager'), ctrl.getTopProducts);
router.get('/low-stock', authorize('admin', 'manager'), ctrl.getLowStock);
router.get('/employee-revenue', authorize('admin', 'manager'), ctrl.getEmployeeRevenue);
router.get('/category-revenue', authorize('admin', 'manager'), ctrl.getCategoryRevenue);
router.get('/profit', authorize('admin', 'manager'), ctrl.getProfit);
router.get('/export', authorize('admin', 'manager'), ctrl.getExportData);
router.get('/rfm', authorize('admin', 'manager'), ctrl.getRFM);
router.get('/inventory-aging', authorize('admin', 'manager'), ctrl.getInventoryAging);
router.get('/payment-methods', authorize('admin', 'manager'), ctrl.getPaymentMethods);

module.exports = router;
