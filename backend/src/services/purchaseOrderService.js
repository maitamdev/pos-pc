const db = require('../config/database');

const POService = {
  async generateCode() {
    const [rows] = await db.query(
      "SELECT po_code FROM purchase_orders ORDER BY id DESC LIMIT 1"
    );
    if (rows.length === 0) return 'PO00001';
    const last = rows[0].po_code;
    const num = parseInt(last.replace('PO', '')) + 1;
    return 'PO' + String(num).padStart(5, '0');
  },

  async getAll({ page = 1, limit = 20, search, status }) {
    let where = [];
    let params = [];
    if (search) { where.push('(po.po_code LIKE ? OR s.name LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (status) { where.push('po.status = ?'); params.push(status); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id ${whereClause}`, params
    );
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT po.*, s.name as supplier_name, u.full_name as user_name
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN users u ON po.user_id = u.id
       ${whereClause} ORDER BY po.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    return { items: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id) {
    const [poRows] = await db.query(
      `SELECT po.*, s.name as supplier_name, u.full_name as user_name
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN users u ON po.user_id = u.id
       WHERE po.id = ?`, [id]
    );
    if (poRows.length === 0) return null;
    const [details] = await db.query(
      `SELECT pod.*, p.sku FROM purchase_order_details pod
       LEFT JOIN products p ON pod.product_id = p.id WHERE pod.po_id = ?`, [id]
    );
    return { ...poRows[0], details };
  },

  async create(data, userId) {
    const code = await this.generateCode();
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        'INSERT INTO purchase_orders (po_code, supplier_id, user_id, subtotal, total, status, notes, expected_date) VALUES (?,?,?,?,?,?,?,?)',
        [code, data.supplier_id, userId, data.subtotal || 0, data.total || 0, 'draft', data.notes || null, data.expected_date || null]
      );
      const poId = result.insertId;
      for (const item of (data.items || [])) {
        await conn.query(
          'INSERT INTO purchase_order_details (po_id, product_id, product_name, quantity, unit_cost, subtotal) VALUES (?,?,?,?,?,?)',
          [poId, item.product_id, item.product_name, item.quantity, item.unit_cost, item.quantity * item.unit_cost]
        );
      }
      await conn.commit();
      return await this.getById(poId);
    } catch (err) { await conn.rollback(); throw err; }
    finally { conn.release(); }
  },

  async receive(id, userId) {
    const po = await this.getById(id);
    if (!po || po.status === 'received' || po.status === 'cancelled') throw new Error('Đơn nhập không hợp lệ');

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // Update stock for each item
      for (const item of po.details) {
        const qty = item.quantity;
        await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [qty, item.product_id]);
        await conn.query('UPDATE purchase_order_details SET received_qty = ? WHERE id = ?', [qty, item.id]);
        await conn.query(
          'INSERT INTO stock_transactions (product_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
          [item.product_id, 'import', qty, `PO: ${po.po_code}`, userId]
        );
      }
      await conn.query(
        "UPDATE purchase_orders SET status = 'received', received_date = CURDATE() WHERE id = ?", [id]
      );
      await conn.commit();
      return await this.getById(id);
    } catch (err) { await conn.rollback(); throw err; }
    finally { conn.release(); }
  },

  async updateStatus(id, status) {
    await db.query('UPDATE purchase_orders SET status = ? WHERE id = ?', [status, id]);
    return await this.getById(id);
  }
};

module.exports = POService;