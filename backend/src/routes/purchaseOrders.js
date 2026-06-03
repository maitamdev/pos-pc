const express = require('express');
const router = express.Router();
const POService = require('../services/purchaseOrderService');
const AuditService = require('../services/auditService');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const result = await POService.getAll(req.query);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', authorize('admin', 'manager'), async (req, res) => {
  try {
    const po = await POService.getById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Không tìm thấy đơn nhập' });
    res.json({ data: po });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const po = await POService.create(req.body, req.user.id);
    await AuditService.log(req.user.id, 'CREATE', 'purchase_order', po.id, { po_code: po.po_code }, req.ip);
    res.status(201).json({ data: po, message: 'Tạo đơn nhập hàng thành công' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/receive', authorize('admin', 'manager'), async (req, res) => {
  try {
    const po = await POService.receive(req.params.id, req.user.id);
    await AuditService.log(req.user.id, 'RECEIVE', 'purchase_order', po.id, { po_code: po.po_code }, req.ip);
    res.json({ data: po, message: 'Nhập kho thành công' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/status', authorize('admin', 'manager'), async (req, res) => {
  try {
    const po = await POService.updateStatus(req.params.id, req.body.status);
    await AuditService.log(req.user.id, 'UPDATE', 'purchase_order', po.id, { status: req.body.status }, req.ip);
    res.json({ data: po, message: 'Cập nhật trạng thái thành công' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;