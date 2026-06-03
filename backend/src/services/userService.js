const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.full_name, u.email, u.phone, u.is_active,
            r.name as role, u.created_at
     FROM users u JOIN roles r ON u.role_id = r.id
     ORDER BY u.created_at DESC`
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role_id, u.is_active,
            r.name as role, u.created_at
     FROM users u JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?`,
    [id]
  );
  if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy người dùng' };
  return rows[0];
};

const getRoleId = async (roleOrId) => {
  if (!roleOrId) return 3; // default staff
  if (typeof roleOrId === 'number' || (typeof roleOrId === 'string' && /^\d+$/.test(roleOrId))) {
    return parseInt(roleOrId);
  }
  const [rows] = await pool.query('SELECT id FROM roles WHERE name = ?', [roleOrId]);
  if (rows.length === 0) throw { statusCode: 400, message: 'Vai trò không hợp lệ' };
  return rows[0].id;
};

const create = async (data) => {
  const { username, password, full_name, email, phone, role, role_id } = data;
  // Check duplicate username
  const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
  if (existing.length > 0) throw { statusCode: 400, message: 'Tên đăng nhập đã tồn tại' };

  const rid = await getRoleId(role || role_id);
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (username, password, full_name, email, phone, role_id) VALUES (?, ?, ?, ?, ?, ?)',
    [username, hash, full_name, email || null, phone || null, rid]
  );
  return { id: result.insertId };
};

const update = async (id, data) => {
  const { full_name, email, phone, role, role_id, is_active, password } = data;
  const rid = await getRoleId(role || role_id);
  let sql = 'UPDATE users SET full_name = ?, email = ?, phone = ?, role_id = ?, is_active = ?';
  const params = [full_name, email || null, phone || null, rid, is_active ?? 1];

  if (password) {
    const hash = await bcrypt.hash(password, 10);
    sql += ', password = ?';
    params.push(hash);
  }

  sql += ' WHERE id = ?';
  params.push(id);
  await pool.query(sql, params);
};

const remove = async (id) => {
  // Soft delete
  await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
};

module.exports = { getAll, getById, create, update, remove };
