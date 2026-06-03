const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createUserValidator, updateUserValidator } = require('../validators/user');

router.use(authenticate);
router.get('/', authorize('admin'), ctrl.getAll);
router.post('/', authorize('admin'), createUserValidator, validate, ctrl.create);
router.put('/:id', authorize('admin'), updateUserValidator, validate, ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
