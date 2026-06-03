const pool = require('../config/database');

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE is_active = 1 ORDER BY name');
  return rows;
};

const create = async (data) => {
  const { name, description } = data;
  const [existing] = await pool.query('SELECT id FROM categories WHERE name = ?', [name]);
  if (existing.length > 0) throw { statusCode: 400, message: 'Tên danh mục đã tồn tại' };
  const [result] = await pool.query(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description || null]
  );
  return { id: result.insertId };
};

const update = async (id, data) => {
  const { name, description } = data;
  await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?',
    [name, description || null, id]);
};

const remove = async (id) => {
  // Check if category has products
  const [products] = await pool.query('SELECT COUNT(*) as cnt FROM products WHERE category_id = ?', [id]);
  if (products[0].cnt > 0) throw { statusCode: 400, message: 'Không thể xóa danh mục đang có sản phẩm' };
  await pool.query('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
};

module.exports = { getAll, create, update, remove };
