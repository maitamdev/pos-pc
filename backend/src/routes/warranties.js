const express = require('express');
const router = express.Router();
const WarrantyService = require('../services/warrantyService');
const AuditService = require('../services/auditService');
const { auth, authorize } = require('../middlewares/auth');

router.use(auth);

router.get('/', authorize('admin', 'manager', 'staff'), async (req, res) => {
  try {
    const result = await WarrantyService.getAll(req.query);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/expiring', authorize('admin', 'manager'), async (req, res) => {
  try {
    const result = await WarrantyService.checkExpiring();
    res.json({ data: result });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', authorize('admin', 'manager', 'staff'), async (req, res) => {
  try {
    const w = await WarrantyService.getById(req.params.id);
    if (!w) return res.status(404).json({ message: 'Không tìm thấy phiếu bảo hành' });
    res.json({ data: w });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const w = await WarrantyService.create(req.body);
    await AuditService.log(req.user.id, 'CREATE', 'warranty', w.id, { warranty_code: w.warranty_code }, req.ip);
    res.status(201).json({ data: w, message: 'Tạo phiếu bảo hành thành công' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/status', authorize('admin', 'manager'), async (req, res) => {
  try {
    const w = await WarrantyService.updateStatus(req.params.id, req.body.status, req.body.notes);
    await AuditService.log(req.user.id, 'UPDATE', 'warranty', w.id, { status: req.body.status }, req.ip);
    res.json({ data: w, message: 'Cập nhật trạng thái thành công' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;