const express = require('express');
const router = express.Router();
const ReturnService = require('../services/returnService');
const AuditService = require('../services/auditService');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const result = await ReturnService.getAll(req.query);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', authorize('admin', 'manager'), async (req, res) => {
  try {
    const ret = await ReturnService.getById(req.params.id);
    if (!ret) return res.status(404).json({ message: 'Không tìm thấy phiếu trả hàng' });
    res.json({ data: ret });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin', 'manager', 'staff'), async (req, res) => {
  try {
    const ret = await ReturnService.create(req.body, req.user.id);
    await AuditService.log(req.user.id, 'CREATE', 'return', ret.id, { return_code: ret.return_code }, req.ip);
    res.status(201).json({ data: ret, message: 'Tạo phiếu trả hàng thành công' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/status', authorize('admin', 'manager'), async (req, res) => {
  try {
    const ret = await ReturnService.updateStatus(req.params.id, req.body.status, req.user.id);
    await AuditService.log(req.user.id, 'UPDATE', 'return', ret.id, { status: req.body.status }, req.ip);
    res.json({ data: ret, message: 'Cập nhật trạng thái thành công' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;