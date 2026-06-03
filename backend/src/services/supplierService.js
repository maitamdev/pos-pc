const pool = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');

const getAll = async (query = {}) => {
  const { page, limit, offset } = paginate(query);
  let where = 'WHERE is_active = 1';
  const params = [];

  if (query.search) {
    where += ' AND (name LIKE ? OR contact LIKE ? OR phone LIKE ?)';
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM suppliers ${where}`, params);
  const sql = `SELECT * FROM suppliers ${where} ORDER BY name LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  const [rows] = await pool.query(sql, params);
  return paginatedResponse(rows, total, page, limit);
};

const getById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
  if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy nhà cung cấp' };
  return rows[0];
};

const create = async (data) => {
  const { name, contact, phone, email, address } = data;
  const [result] = await pool.query(
    'INSERT INTO suppliers (name, contact, phone, email, address) VALUES (?, ?, ?, ?, ?)',
    [name, contact || null, phone || null, email || null, address || null]
  );
  return { id: result.insertId };
};

const update = async (id, data) => {
  const { name, contact, phone, email, address } = data;
  await pool.query(
    'UPDATE suppliers SET name = ?, contact = ?, phone = ?, email = ?, address = ? WHERE id = ?',
    [name, contact || null, phone || null, email || null, address || null, id]
  );
};

const remove = async (id) => {
  const [products] = await pool.query('SELECT COUNT(*) as cnt FROM products WHERE supplier_id = ?', [id]);
  if (products[0].cnt > 0) throw { statusCode: 400, message: 'Không thể xóa nhà cung cấp đang có sản phẩm' };
  await pool.query('UPDATE suppliers SET is_active = 0 WHERE id = ?', [id]);
};

module.exports = { getAll, getById, create, update, remove };
