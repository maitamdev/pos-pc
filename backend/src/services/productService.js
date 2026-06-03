const pool = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');

const getAll = async (query = {}) => {
  const { page, limit, offset } = paginate(query);
  const baseFrom = `FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN suppliers s ON p.supplier_id = s.id
             WHERE p.is_active = 1`;
  let countSql = `SELECT COUNT(*) as total ${baseFrom}`;
  let sql = `SELECT p.*, c.name as category_name, s.name as supplier_name ${baseFrom}`;
  const params = [];

  if (query.search) {
    const cond = ' AND (p.name LIKE ? OR p.sku LIKE ?)';
    countSql += cond;
    sql += cond;
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  if (query.category_id) {
    const cond = ' AND p.category_id = ?';
    countSql += cond;
    sql += cond;
    params.push(query.category_id);
  }
  if (query.component_type) {
    const cond = ' AND p.component_type = ?';
    countSql += cond;
    sql += cond;
    params.push(query.component_type);
  }

  const [[{ total }]] = await pool.query(countSql, params);
  sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const [rows] = await pool.query(sql, params);
  return paginatedResponse(rows, total, page, limit);
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name as category_name, s.name as supplier_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN suppliers s ON p.supplier_id = s.id
     WHERE p.id = ?`,
    [id]
  );
  if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy sản phẩm' };
  return rows[0];
};

const create = async (data) => {
  const {
    sku, name, description, category_id, supplier_id,
    cost_price, selling_price, stock, min_stock_level,
    image, component_type, socket, ram_type, power_watt
  } = data;

  // SKU uniqueness
  const [existing] = await pool.query('SELECT id FROM products WHERE sku = ?', [sku]);
  if (existing.length > 0) throw { statusCode: 400, message: 'SKU đã tồn tại' };

  const [result] = await pool.query(
    `INSERT INTO products (sku, name, description, category_id, supplier_id,
      cost_price, selling_price, stock, min_stock_level, image,
      component_type, socket, ram_type, power_watt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [sku, name, description || null, category_id || null, supplier_id || null,
     cost_price, selling_price, stock || 0, min_stock_level || 5, image || null,
     component_type || null, socket || null, ram_type || null, power_watt || null]
  );
  return { id: result.insertId };
};

const update = async (id, data) => {
  const {
    name, description, category_id, supplier_id,
    cost_price, selling_price, min_stock_level,
    image, component_type, socket, ram_type, power_watt
  } = data;

  await pool.query(
    `UPDATE products SET name=?, description=?, category_id=?, supplier_id=?,
      cost_price=?, selling_price=?, min_stock_level=?, image=?,
      component_type=?, socket=?, ram_type=?, power_watt=?
     WHERE id=?`,
    [name, description || null, category_id || null, supplier_id || null,
     cost_price, selling_price, min_stock_level || 5, image || null,
     component_type || null, socket || null, ram_type || null, power_watt || null, id]
  );
};

const remove = async (id) => {
  await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
};

const getLowStock = async () => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name as category_name
     FROM products p LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.is_active = 1 AND p.stock <= p.min_stock_level
     ORDER BY (p.stock - p.min_stock_level) ASC`
  );
  return rows;
};

module.exports = { getAll, getById, create, update, remove, getLowStock };
