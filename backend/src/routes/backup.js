const express = require('express');
const router = express.Router();
const BackupService = require('../services/backupService');
const AuditService = require('../services/auditService');
const { authenticate, authorize } = require('../middlewares/auth');
const path = require('path');

router.use(authenticate);
router.use(authorize('admin'));

router.post('/create', async (req, res) => {
  try {
    const backup = await BackupService.createBackup();
    await AuditService.log(req.user.id, 'CREATE', 'backup', null, { filename: backup.filename }, req.ip);
    res.json({ data: backup, message: 'Backup thành công' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/list', async (req, res) => {
  try {
    const backups = await BackupService.listBackups();
    res.json({ data: backups });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/download/:filename', async (req, res) => {
  try {
    const filepath = BackupService.getBackupPath(req.params.filename);
    res.download(filepath);
  } catch (err) { res.status(404).json({ message: 'Không tìm thấy file backup' }); }
});

router.delete('/:filename', async (req, res) => {
  try {
    const deleted = await BackupService.deleteBackup(req.params.filename);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy file backup' });
    await AuditService.log(req.user.id, 'DELETE', 'backup', null, { filename: req.params.filename }, req.ip);
    res.json({ message: 'Đã xóa backup' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;