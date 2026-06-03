const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createCategoryValidator, updateCategoryValidator } = require('../validators/category');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', authorize('admin'), createCategoryValidator, validate, ctrl.create);
router.put('/:id', authorize('admin'), updateCategoryValidator, validate, ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
