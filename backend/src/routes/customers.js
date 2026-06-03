const router = require('express').Router();
const ctrl = require('../controllers/customerController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createCustomerValidator, updateCustomerValidator } = require('../validators/customer');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', createCustomerValidator, validate, ctrl.create);
router.put('/:id', updateCustomerValidator, validate, ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id/orders', ctrl.getOrders);
router.get('/:id/loyalty-points', ctrl.getLoyaltyHistory);

module.exports = router;
