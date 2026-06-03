const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createOrderValidator } = require('../validators/order');

router.use(authenticate);
router.post('/', createOrderValidator, validate, ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/:id/cancel', ctrl.cancel);

module.exports = router;