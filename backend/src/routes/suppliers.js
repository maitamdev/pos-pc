const router = require('express').Router();
const ctrl = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createSupplierValidator, updateSupplierValidator } = require('../validators/supplier');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'manager'), createSupplierValidator, validate, ctrl.create);
router.put('/:id', authorize('admin', 'manager'), updateSupplierValidator, validate, ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
