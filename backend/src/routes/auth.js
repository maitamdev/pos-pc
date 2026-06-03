const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { loginValidator, changePasswordValidator } = require('../validators/auth');

router.post('/login', loginValidator, validate, ctrl.login);
router.get('/me', authenticate, ctrl.getMe);
router.post('/logout', authenticate, ctrl.logout);
router.put('/change-password', authenticate, changePasswordValidator, validate, ctrl.changePassword);

module.exports = router;
