const router = require('express').Router();
const upload = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');
const { success, error } = require('../utils/response');

router.use(authenticate);

// Upload single image
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return error(res, 'Không tìm thấy file upload', 400);
  }
  const type = req.query.type || 'products';
  const url = `/uploads/${type}/${req.file.filename}`;
  return success(res, { url, filename: req.file.filename }, 'Upload thành công');
});

// Upload multiple images (max 5)
router.post('/multiple', upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return error(res, 'Không tìm thấy file upload', 400);
  }
  const type = req.query.type || 'products';
  const files = req.files.map(f => ({
    url: `/uploads/${type}/${f.filename}`,
    filename: f.filename,
  }));
  return success(res, files, 'Upload thành công');
});

module.exports = router;