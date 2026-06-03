const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await NotificationService.getAll(req.user.id, req.query);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    await NotificationService.markRead(req.params.id);
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/read-all', async (req, res) => {
  try {
    await NotificationService.markAllRead(req.user.id);
    res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;