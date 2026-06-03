const db = require('../config/database');

const WarrantyService = {
  async generateCode() {
    const [rows] = await db.query("SELECT warranty_code FROM warranties ORDER BY id DESC LIMIT 1");
    if (rows.length === 0) return 'BH00001';
    const num = parseInt(rows[0].warranty_code.replace('BH', '')) + 1;
    return 'BH' + String(num).padStart(5, '0');
  },

  async getAll({ page = 1, limit = 20, search, status }) {
    let where = [];
    let params = [];
    if (search) { where.push('(w.warranty_code LIKE ? OR p.name LIKE ? OR c.name LIKE ? OR w.serial_number LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
    if (status) { where.push('w.status = ?'); params.push(status); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM warranties w LEFT JOIN products p ON w.product_id = p.id LEFT JOIN customers c ON w.customer_id = c.id ${whereClause}`, params
    );
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT w.*, p.name as product_name, p.sku, c.name as customer_name, c.phone as customer_phone
       FROM warranties w
       LEFT JOIN products p ON w.product_id = p.id
       LEFT JOIN customers c ON w.customer_id = c.id
       ${whereClause} ORDER BY w.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    return { items: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id) {
    const [rows] = await db.query(
      `SELECT w.*, p.name as product_name, p.sku, c.name as customer_name, c.phone as customer_phone, o.order_code
       FROM warranties w
       LEFT JOIN products p ON w.product_id = p.id
       LEFT JOIN customers c ON w.customer_id = c.id
       LEFT JOIN orders o ON w.order_id = o.id
       WHERE w.id = ?`, [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const code = await this.generateCode();
    const endDate = new Date(data.start_date);
    endDate.setMonth(endDate.getMonth() + (data.warranty_months || 12));
    const endStr = endDate.toISOString().slice(0, 10);

    const [result] = await db.query(
      'INSERT INTO warranties (warranty_code, order_id, product_id, customer_id, serial_number, warranty_months, start_date, end_date, notes) VALUES (?,?,?,?,?,?,?,?,?)',
      [code, data.order_id || null, data.product_id, data.customer_id, data.serial_number || null, data.warranty_months || 12, data.start_date, endStr, data.notes || null]
    );
    return await this.getById(result.insertId);
  },

  async updateStatus(id, status, notes) {
    let sql = 'UPDATE warranties SET status = ?';
    let params = [status];
    if (notes) { sql += ', notes = ?'; params.push(notes); }
    sql += ' WHERE id = ?';
    params.push(id);
    await db.query(sql, params);
    return await this.getById(id);
  },

  async checkExpiring() {
    const [rows] = await db.query(
      `SELECT w.*, p.name as product_name, c.name as customer_name, c.phone as customer_phone
       FROM warranties w
       LEFT JOIN products p ON w.product_id = p.id
       LEFT JOIN customers c ON w.customer_id = c.id
       WHERE w.status = 'active' AND w.end_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY w.end_date ASC`
    );
    return rows;
  }
};

module.exports = WarrantyService;