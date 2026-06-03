const router = require('express').Router();
const ctrl = require('../controllers/promotionController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createPromotionValidator, updatePromotionValidator, validatePromotionValidator } = require('../validators/promotion');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', authorize('admin', 'manager'), createPromotionValidator, validate, ctrl.create);
router.put('/:id', authorize('admin', 'manager'), updatePromotionValidator, validate, ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);
router.post('/validate', validatePromotionValidator, validate, ctrl.validateCode);

module.exports = router;