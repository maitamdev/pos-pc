const express = require('express');
const router = express.Router();
const AuditService = require('../services/auditService');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', async (req, res) => {
  try {
    const result = await AuditService.getAll(req.query);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;