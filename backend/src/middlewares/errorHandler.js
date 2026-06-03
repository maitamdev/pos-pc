const { error } = require('../utils/response');

// Centralized error handler
const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);
  if (err.code === 'ER_DUP_ENTRY') {
    return error(res, 'Dữ liệu bị trùng lặp', 400);
  }
  return error(res, err.message || 'Lỗi server nội bộ', err.statusCode || 500);
};

module.exports = errorHandler;
