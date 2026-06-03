const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createProductValidator, updateProductValidator } = require('../validators/product');

router.use(authenticate);
router.get('/low-stock', ctrl.getLowStock);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'manager'), createProductValidator, validate, ctrl.create);
router.put('/:id', authorize('admin', 'manager'), updateProductValidator, validate, ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
