const db = require('../config/database');

const AuditService = {
  async log(userId, action, entity, entityId, details = null, ipAddress = null) {
    try {
      await db.query(
        'INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, action, entity, entityId, details ? JSON.stringify(details) : null, ipAddress]
      );
    } catch (err) {
      console.error('Audit log error:', err.message);
    }
  },

  async getAll({ page = 1, limit = 20, user_id, action, entity, date_from, date_to }) {
    let where = [];
    let params = [];

    if (user_id) { where.push('al.user_id = ?'); params.push(user_id); }
    if (action) { where.push('al.action = ?'); params.push(action); }
    if (entity) { where.push('al.entity = ?'); params.push(entity); }
    if (date_from) { where.push('al.created_at >= ?'); params.push(date_from); }
    if (date_to) { where.push('al.created_at <= ?'); params.push(date_to + ' 23:59:59'); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM audit_logs al ${whereClause}`, params
    );
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT al.*, u.full_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return {
      items: rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    };
  }
};

module.exports = AuditService;