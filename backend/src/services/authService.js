const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (username, password) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.name as role_name
     FROM users u JOIN roles r ON u.role_id = r.id
     WHERE u.username = ? AND u.is_active = 1`,
    [username]
  );
  if (rows.length === 0) throw { statusCode: 401, message: 'Sai tên đăng nhập hoặc mật khẩu' };

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { statusCode: 401, message: 'Sai tên đăng nhập hoặc mật khẩu' };

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role_name,
    },
  };
};

const getMe = async (userId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.full_name, u.email, u.phone, r.name as role
     FROM users u JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?`,
    [userId]
  );
  if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };
  return rows[0];
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
  if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };

  const match = await bcrypt.compare(currentPassword, rows[0].password);
  if (!match) throw { statusCode: 400, message: 'Mật khẩu hiện tại không đúng' };

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);
};

module.exports = { login, getMe, changePassword };
