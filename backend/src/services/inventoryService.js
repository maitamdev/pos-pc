const pool = require('../config/database');

/**
 * Nhập kho
 * Business rule: Khi nhập kho nếu stock > min_stock_level thì chuyển cảnh báo sang resolved
 */
const importStock = async (productId, quantity, reference, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (quantity <= 0) throw { statusCode: 400, message: 'Số lượng nhập phải lớn hơn 0' };

    const [products] = await conn.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) throw { statusCode: 404, message: 'Không tìm thấy sản phẩm' };

    // Update stock
    await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, productId]);

    // Record transaction
    await conn.query(
      'INSERT INTO stock_transactions (product_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
      [productId, 'import', quantity, reference || null, userId]
    );

    // Check if stock now above min → resolve active alerts
    const [afterUpdate] = await conn.query('SELECT stock, min_stock_level FROM products WHERE id = ?', [productId]);
    if (afterUpdate[0].stock > afterUpdate[0].min_stock_level) {
      await conn.query(
        "UPDATE stock_alerts SET status = 'resolved', resolved_at = NOW() WHERE product_id = ? AND status = 'active'",
        [productId]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Điều chỉnh tồn kho
 */
const adjustStock = async (productId, newQuantity, reference, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [products] = await conn.query('SELECT stock FROM products WHERE id = ?', [productId]);
    if (products.length === 0) throw { statusCode: 404, message: 'Không tìm thấy sản phẩm' };

    const diff = newQuantity - products[0].stock;
    await conn.query('UPDATE products SET stock = ? WHERE id = ?', [newQuantity, productId]);

    await conn.query(
      'INSERT INTO stock_transactions (product_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
      [productId, 'adjustment', diff, reference || 'Điều chỉnh kho', userId]
    );

    // Resolve or create alert
    const [prod] = await conn.query('SELECT stock, min_stock_level FROM products WHERE id = ?', [productId]);
    if (prod[0].stock > prod[0].min_stock_level) {
      await conn.query(
        "UPDATE stock_alerts SET status = 'resolved', resolved_at = NOW() WHERE product_id = ? AND status = 'active'",
        [productId]
      );
    } else {
      const [existing] = await conn.query(
        "SELECT id FROM stock_alerts WHERE product_id = ? AND status = 'active'",
        [productId]
      );
      if (existing.length === 0) {
        await conn.query(
          'INSERT INTO stock_alerts (product_id, current_stock, min_stock) VALUES (?, ?, ?)',
          [productId, prod[0].stock, prod[0].min_stock_level]
        );
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getTransactions = async (query = {}) => {
  let sql = `SELECT st.*, p.name as product_name, p.sku, u.full_name as user_name
             FROM stock_transactions st
             JOIN products p ON st.product_id = p.id
             JOIN users u ON st.user_id = u.id WHERE 1=1`;
  const params = [];
  if (query.product_id) { sql += ' AND st.product_id = ?'; params.push(query.product_id); }
  if (query.type) { sql += ' AND st.type = ?'; params.push(query.type); }
  sql += ' ORDER BY st.created_at DESC LIMIT 200';
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getLowStockAlerts = async () => {
  const [rows] = await pool.query(
    `SELECT sa.*, p.name as product_name, p.sku, p.stock, p.min_stock_level
     FROM stock_alerts sa
     JOIN products p ON sa.product_id = p.id
     WHERE sa.status = 'active'
     ORDER BY sa.created_at DESC`
  );
  return rows;
};

const resolveAlert = async (alertId) => {
  await pool.query(
    "UPDATE stock_alerts SET status = 'resolved', resolved_at = NOW() WHERE id = ?",
    [alertId]
  );
};

module.exports = { importStock, adjustStock, getTransactions, getLowStockAlerts, resolveAlert };
