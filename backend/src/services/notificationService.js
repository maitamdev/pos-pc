const db = require('../config/database');

const NotificationService = {
  async create({ user_id, type, title, message, link }) {
    const [result] = await db.query(
      'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
      [user_id || null, type, title, message, link || null]
    );
    return { id: result.insertId, user_id, type, title, message, link };
  },

  async getAll(userId, { page = 1, limit = 20, unread_only }) {
    let where = [];
    let params = [];
    if (userId) { where.push('(n.user_id = ? OR n.user_id IS NULL)'); params.push(userId); }
    if (unread_only === 'true') { where.push('n.is_read = 0'); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM notifications n ${whereClause}`, params);
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT n.* FROM notifications n ${whereClause} ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [unread] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0', [userId]
    );

    return { items: rows, unread_count: unread[0].count, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
  },

  async markRead(id) {
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
  },

  async markAllRead(userId) {
    await db.query('UPDATE notifications SET is_read = 1 WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0', [userId]);
  },

  async checkAndNotify() {
    // Check low stock
    const threshold = 5;
    const [lowStock] = await db.query(
      'SELECT COUNT(*) as count FROM products WHERE stock > 0 AND stock <= ? AND is_active = 1', [threshold]
    );
    if (lowStock[0].count > 0) {
      const exists = await db.query(
        "SELECT id FROM notifications WHERE type = 'low_stock' AND is_read = 0 AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)"
      );
      if (exists[0].length === 0) {
        await this.create({ type: 'low_stock', title: 'Cảnh báo tồn kho thấp', message: `Có ${lowStock[0].count} sản phẩm sắp hết hàng`, link: '/low-stock-alerts' });
      }
    }

    // Check expiring warranties
    const [expiring] = await db.query(
      "SELECT COUNT(*) as count FROM warranties WHERE status = 'active' AND end_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)"
    );
    if (expiring[0].count > 0) {
      const exists = await db.query(
        "SELECT id FROM notifications WHERE type = 'warranty_expiring' AND is_read = 0 AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)"
      );
      if (exists[0].length === 0) {
        await this.create({ type: 'warranty_expiring', title: 'Bảo hành sắp hết hạn', message: `Có ${expiring[0].count} phiếu bảo hành sắp hết hạn trong 30 ngày tới`, link: '/warranties' });
      }
    }
  }
};

module.exports = NotificationService;