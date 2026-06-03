const router = require('express').Router();
const ctrl = require('../controllers/aiController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.post('/build-pc', ctrl.buildPc);
router.post('/check-compatibility', ctrl.checkCompatibility);
router.get('/suggest/:productId', ctrl.suggestCompatible);

module.exports = router;