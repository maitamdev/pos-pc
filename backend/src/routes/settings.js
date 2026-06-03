const express = require('express');
const router = express.Router();
const SettingsService = require('../services/settingsService');
const AuditService = require('../services/auditService');
const { auth, authorize } = require('../middlewares/auth');

router.use(auth);

router.get('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const settings = await SettingsService.getAll();
    res.json({ data: settings });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/', authorize('admin'), async (req, res) => {
  try {
    const settings = await SettingsService.update(req.body);
    await AuditService.log(req.user.id, 'UPDATE', 'settings', null, { keys: Object.keys(req.body) }, req.ip);
    res.json({ data: settings, message: 'Cập nhật cài đặt thành công' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;