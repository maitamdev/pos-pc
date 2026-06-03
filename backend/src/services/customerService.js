const pool = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');

const getAll = async (query = {}) => {
  const { page, limit, offset } = paginate(query);
  let countSql = 'SELECT COUNT(*) as total FROM customers WHERE 1=1';
  let sql = 'SELECT * FROM customers WHERE 1=1';
  const params = [];

  if (query.search) {
    const cond = ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    countSql += cond;
    sql += cond;
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }

  const [[{ total }]] = await pool.query(countSql, params);
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const [rows] = await pool.query(sql, params);
  return paginatedResponse(rows, total, page, limit);
};

const getById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
  if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy khách hàng' };
  return rows[0];
};

const create = async (data) => {
  const { name, phone, email, address } = data;
  const [result] = await pool.query(
    'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
    [name, phone || null, email || null, address || null]
  );
  return { id: result.insertId };
};

const update = async (id, data) => {
  const { name, phone, email, address } = data;
  await pool.query(
    'UPDATE customers SET name=?, phone=?, email=?, address=? WHERE id=?',
    [name, phone || null, email || null, address || null, id]
  );
};

const remove = async (id) => {
  const [orders] = await pool.query('SELECT COUNT(*) as cnt FROM orders WHERE customer_id = ?', [id]);
  if (orders[0].cnt > 0) {
    throw { statusCode: 400, message: 'Không thể xóa khách hàng đã có đơn hàng' };
  }
  await pool.query('DELETE FROM customers WHERE id = ?', [id]);
};

const getOrders = async (customerId) => {
  const [rows] = await pool.query(
    `SELECT o.*, u.full_name as staff_name
     FROM orders o JOIN users u ON o.user_id = u.id
     WHERE o.customer_id = ?
     ORDER BY o.created_at DESC`,
    [customerId]
  );
  return rows;
};

const getLoyaltyHistory = async (customerId) => {
  const [rows] = await pool.query(
    `SELECT lp.*, o.order_code
     FROM loyalty_points lp
     LEFT JOIN orders o ON lp.order_id = o.id
     WHERE lp.customer_id = ?
     ORDER BY lp.created_at DESC`,
    [customerId]
  );
  return rows;
};

module.exports = { getAll, getById, create, update, remove, getOrders, getLoyaltyHistory };
