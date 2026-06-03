const db = require('../config/database');

const ReturnService = {
  async generateCode() {
    const [rows] = await db.query("SELECT return_code FROM returns ORDER BY id DESC LIMIT 1");
    if (rows.length === 0) return 'RT00001';
    const num = parseInt(rows[0].return_code.replace('RT', '')) + 1;
    return 'RT' + String(num).padStart(5, '0');
  },

  async getAll({ page = 1, limit = 20, search, status }) {
    let where = [];
    let params = [];
    if (search) { where.push('(r.return_code LIKE ? OR o.order_code LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (status) { where.push('r.status = ?'); params.push(status); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM returns r LEFT JOIN orders o ON r.order_id = o.id ${whereClause}`, params
    );
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT r.*, o.order_code, c.name as customer_name, u.full_name as user_name
       FROM returns r
       LEFT JOIN orders o ON r.order_id = o.id
       LEFT JOIN customers c ON r.customer_id = c.id
       LEFT JOIN users u ON r.user_id = u.id
       ${whereClause} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    return { items: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id) {
    const [rows] = await db.query(
      `SELECT r.*, o.order_code, c.name as customer_name, u.full_name as user_name
       FROM returns r
       LEFT JOIN orders o ON r.order_id = o.id
       LEFT JOIN customers c ON r.customer_id = c.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`, [id]
    );
    if (rows.length === 0) return null;
    const [details] = await db.query(
      'SELECT rd.*, p.sku FROM return_details rd LEFT JOIN products p ON rd.product_id = p.id WHERE rd.return_id = ?', [id]
    );
    return { ...rows[0], details };
  },

  async create(data, userId) {
    const code = await this.generateCode();
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        'INSERT INTO returns (return_code, order_id, customer_id, user_id, total_refund, reason, status, refund_method) VALUES (?,?,?,?,?,?,?,?)',
        [code, data.order_id, data.customer_id || null, userId, data.total_refund || 0, data.reason || null, 'pending', data.refund_method || 'cash']
      );
      const retId = result.insertId;
      for (const item of (data.items || [])) {
        await conn.query(
          'INSERT INTO return_details (return_id, product_id, product_name, quantity, unit_price, subtotal, reason) VALUES (?,?,?,?,?,?,?)',
          [retId, item.product_id, item.product_name, item.quantity, item.unit_price, item.quantity * item.unit_price, item.reason || null]
        );
      }
      await conn.commit();
      return await this.getById(retId);
    } catch (err) { await conn.rollback(); throw err; }
    finally { conn.release(); }
  },

  async updateStatus(id, status, userId) {
    const ret = await this.getById(id);
    if (!ret) throw new Error('Không tìm thấy phiếu trả hàng');

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('UPDATE returns SET status = ? WHERE id = ?', [status, id]);

      // If completed, restore stock and deduct loyalty
      if (status === 'completed') {
        for (const item of ret.details) {
          await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
          await conn.query(
            'INSERT INTO stock_transactions (product_id, type, quantity, reference, user_id) VALUES (?,?,?,?,?)',
            [item.product_id, 'adjustment', item.quantity, `RETURN: ${ret.return_code}`, userId]
          );
        }
        // Deduct loyalty points if customer exists
        if (ret.customer_id && ret.total_refund > 0) {
          const points = -Math.floor(ret.total_refund / 1000);
          if (points < 0) {
            await conn.query('UPDATE customers SET loyalty_points = GREATEST(0, loyalty_points + ?) WHERE id = ?', [points, ret.customer_id]);
            await conn.query(
              'INSERT INTO loyalty_points (customer_id, order_id, points, type, description) VALUES (?,?,?,?,?)',
              [ret.customer_id, ret.order_id, points, 'redeem', `Hoàn tiền đơn ${ret.order_code}`]
            );
          }
        }
      }
      await conn.commit();
      return await this.getById(id);
    } catch (err) { await conn.rollback(); throw err; }
    finally { conn.release(); }
  }
};

module.exports = ReturnService;