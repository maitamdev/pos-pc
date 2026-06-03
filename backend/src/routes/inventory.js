const router = require('express').Router();
const ctrl = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { importStockValidator, adjustStockValidator } = require('../validators/inventory');

router.use(authenticate);
router.get('/transactions', ctrl.getTransactions);
router.get('/alerts', ctrl.getLowStockAlerts);
router.post('/import', authorize('admin', 'manager'), importStockValidator, validate, ctrl.importStock);
router.post('/adjust', authorize('admin', 'manager'), adjustStockValidator, validate, ctrl.adjustStock);
router.put('/alerts/:id/resolve', authorize('admin', 'manager'), ctrl.resolveAlert);

module.exports = router;