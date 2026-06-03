const pool = require('../config/database');
const { paginate, paginatedResponse } = require('../utils/pagination');

// Generate unique order code: ORD-YYYYMMDD-XXXX
const generateOrderCode = () => {
  const d = new Date();
  const dateStr = d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `ORD-${dateStr}-${rand}`;
};

/**
 * Tạo đơn hàng mới
 * Business rules:
 * - Không bán vượt tồn kho
 * - Chỉ khi thanh toán thành công mới trừ kho
 * - Sau bán: nếu stock <= min_stock_level → tạo cảnh báo tồn kho thấp
 * - Áp dụng khuyến mãi: kiểm tra hạn & số lần dùng
 * - Tích điểm khách hàng: 1 điểm / 100,000đ
 */
const create = async (data, userId) => {
  const { customer_id, items, promotion_code, payment_method, notes } = data;
  // items: [{ product_id, quantity }]

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Validate items & calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const [prodRows] = await conn.query(
        'SELECT id, name, selling_price, stock FROM products WHERE id = ? AND is_active = 1',
        [item.product_id]
      );
      if (prodRows.length === 0) throw { statusCode: 400, message: `Sản phẩm ID ${item.product_id} không tồn tại` };

      const product = prodRows[0];
      if (product.stock < item.quantity) {
        throw { statusCode: 400, message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho` };
      }

      const lineTotal = product.selling_price * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.selling_price,
        subtotal: lineTotal,
      });
    }

    // 2. Apply promotion
    let discountAmount = 0;
    let promotionId = null;

    if (promotion_code) {
      const [promoRows] = await conn.query(
        'SELECT * FROM promotions WHERE code = ? AND is_active = 1',
        [promotion_code]
      );
      if (promoRows.length === 0) throw { statusCode: 400, message: 'Mã khuyến mãi không tồn tại' };

      const promo = promoRows[0];
      const now = new Date();

      // Kiểm tra hạn sử dụng
      if (promo.start_date && new Date(promo.start_date) > now) {
        throw { statusCode: 400, message: 'Mã khuyến mãi chưa đến ngày sử dụng' };
      }
      if (promo.end_date && new Date(promo.end_date) < now) {
        throw { statusCode: 400, message: 'Mã khuyến mãi đã hết hạn' };
      }
      // Kiểm tra số lần sử dụng
      if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
        throw { statusCode: 400, message: 'Mã khuyến mãi đã hết lượt sử dụng' };
      }
      // Kiểm tra đơn tối thiểu
      if (promo.min_order && subtotal < promo.min_order) {
        throw { statusCode: 400, message: `Đơn hàng tối thiểu ${promo.min_order} để sử dụng mã này` };
      }

      // Tính giảm giá
      if (promo.discount_type === 'percent') {
        discountAmount = subtotal * (promo.discount_value / 100);
        if (promo.max_discount && discountAmount > promo.max_discount) {
          discountAmount = promo.max_discount;
        }
      } else {
        discountAmount = promo.discount_value;
      }
      promotionId = promo.id;
    }

    const total = subtotal - discountAmount;

    // 3. Create order
    const orderCode = generateOrderCode();
    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_code, customer_id, user_id, subtotal, discount_amount, promotion_id, total, payment_method, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
      [orderCode, customer_id || null, userId, subtotal, discountAmount, promotionId, total, payment_method || 'cash', notes || null]
    );
    const orderId = orderResult.insertId;

    // 4. Insert order_details & deduct stock
    for (const item of orderItems) {
      await conn.query(
        'INSERT INTO order_details (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.product_name, item.quantity, item.unit_price, item.subtotal]
      );

      // Trừ tồn kho
      const [updateResult] = await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.quantity, item.product_id, item.quantity]
      );
      if (updateResult.affectedRows === 0) {
        throw { statusCode: 400, message: `Sản phẩm "${item.product_name}" không đủ tồn kho` };
      }

      // Ghi stock transaction (export)
      await conn.query(
        'INSERT INTO stock_transactions (product_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
        [item.product_id, 'export', -item.quantity, `Order ${orderCode}`, userId]
      );

      // Kiểm tra tồn kho thấp → tạo cảnh báo
      const [prodAfter] = await conn.query(
        'SELECT stock, min_stock_level FROM products WHERE id = ?',
        [item.product_id]
      );
      if (prodAfter[0].stock <= prodAfter[0].min_stock_level) {
        // Kiểm tra đã có cảnh báo active chưa
        const [existingAlert] = await conn.query(
          "SELECT id FROM stock_alerts WHERE product_id = ? AND status = 'active'",
          [item.product_id]
        );
        if (existingAlert.length === 0) {
          await conn.query(
            'INSERT INTO stock_alerts (product_id, current_stock, min_stock, status) VALUES (?, ?, ?, ?)',
            [item.product_id, prodAfter[0].stock, prodAfter[0].min_stock_level, 'active']
          );
        }
      }
    }

    // 5. Update promotion used_count
    if (promotionId) {
      await conn.query('UPDATE promotions SET used_count = used_count + 1 WHERE id = ?', [promotionId]);
    }

    // 6. Add loyalty points to customer (1 point per 100,000 VND)
    if (customer_id) {
      const pointsEarned = Math.floor(total / 100000);
      if (pointsEarned > 0) {
        await conn.query(
          'UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?',
          [pointsEarned, customer_id]
        );
        await conn.query(
          'INSERT INTO loyalty_points (customer_id, order_id, points, type, description) VALUES (?, ?, ?, ?, ?)',
          [customer_id, orderId, pointsEarned, 'earn', `Tích điểm từ đơn ${orderCode}`]
        );
      }
    }

    await conn.commit();

    // Return full order
    const [order] = await pool.query(
      `SELECT o.*, u.full_name as staff_name, c.name as customer_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [orderId]
    );
    const [details] = await pool.query('SELECT * FROM order_details WHERE order_id = ?', [orderId]);

    return { ...order[0], items: details };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getAll = async (query = {}, userId, userRole) => {
  const { page, limit, offset } = paginate(query);
  const baseFrom = `FROM orders o
             JOIN users u ON o.user_id = u.id
             LEFT JOIN customers c ON o.customer_id = c.id WHERE 1=1`;
  let countSql = `SELECT COUNT(*) as total ${baseFrom}`;
  let sql = `SELECT o.*, u.full_name as staff_name, c.name as customer_name ${baseFrom}`;
  const params = [];

  // Staff chỉ xem đơn của mình
  if (userRole === 'staff') {
    const cond = ' AND o.user_id = ?';
    countSql += cond;
    sql += cond;
    params.push(userId);
  }
  if (query.status) {
    const cond = ' AND o.status = ?';
    countSql += cond;
    sql += cond;
    params.push(query.status);
  }
  if (query.date_from) {
    const cond = ' AND DATE(o.created_at) >= ?';
    countSql += cond;
    sql += cond;
    params.push(query.date_from);
  }
  if (query.date_to) {
    const cond = ' AND DATE(o.created_at) <= ?';
    countSql += cond;
    sql += cond;
    params.push(query.date_to);
  }
  if (query.search) {
    const cond = ' AND (o.order_code LIKE ? OR c.name LIKE ? OR c.phone LIKE ?)';
    countSql += cond;
    sql += cond;
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }

  const [[{ total }]] = await pool.query(countSql, params);
  sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const [rows] = await pool.query(sql, params);
  return paginatedResponse(rows, total, page, limit);
};

const getById = async (id, userId, userRole) => {
  const [orders] = await pool.query(
    `SELECT o.*, u.full_name as staff_name, c.name as customer_name, c.phone as customer_phone
     FROM orders o
     JOIN users u ON o.user_id = u.id
     LEFT JOIN customers c ON o.customer_id = c.id
     WHERE o.id = ?`,
    [id]
  );
  if (orders.length === 0) throw { statusCode: 404, message: 'Không tìm thấy hóa đơn' };

  const order = orders[0];
  // Staff chỉ xem đơn của mình
  if (userRole === 'staff' && order.user_id !== userId) {
    throw { statusCode: 403, message: 'Bạn không có quyền xem hóa đơn này' };
  }

  const [details] = await pool.query('SELECT * FROM order_details WHERE order_id = ?', [id]);
  return { ...order, items: details };
};

const cancel = async (id, userId, userRole) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orders] = await conn.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) throw { statusCode: 404, message: 'Không tìm thấy hóa đơn' };
    const order = orders[0];

    if (userRole === 'staff' && order.user_id !== userId) {
      throw { statusCode: 403, message: 'Bạn không có quyền hủy hóa đơn này' };
    }
    if (order.status === 'cancelled') throw { statusCode: 400, message: 'Hóa đơn đã bị hủy' };

    // Update status
    await conn.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [id]);

    // Restore stock
    const [details] = await conn.query('SELECT * FROM order_details WHERE order_id = ?', [id]);
    for (const item of details) {
      await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      await conn.query(
        'INSERT INTO stock_transactions (product_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
        [item.product_id, 'import', item.quantity, `Cancel Order ${order.order_code}`, userId]
      );
    }

    // Reverse loyalty points
    if (order.customer_id) {
      const [lpRows] = await conn.query(
        "SELECT id, points FROM loyalty_points WHERE order_id = ? AND type = 'earn'",
        [id]
      );
      if (lpRows.length > 0) {
        await conn.query(
          'UPDATE customers SET loyalty_points = loyalty_points - ? WHERE id = ?',
          [lpRows[0].points, order.customer_id]
        );
        await conn.query('DELETE FROM loyalty_points WHERE id = ?', [lpRows[0].id]);
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

module.exports = { create, getAll, getById, cancel };
