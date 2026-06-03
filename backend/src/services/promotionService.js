const pool = require('../config/database');

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM promotions ORDER BY created_at DESC');
  return rows;
};

const create = async (data) => {
  const { code, description, discount_type, discount_value, min_order, max_discount, max_uses, start_date, end_date } = data;

  const [existing] = await pool.query('SELECT id FROM promotions WHERE code = ?', [code]);
  if (existing.length > 0) throw { statusCode: 400, message: 'Mã khuyến mãi đã tồn tại' };

  const [result] = await pool.query(
    `INSERT INTO promotions (code, description, discount_type, discount_value, min_order, max_discount, max_uses, start_date, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, description || null, discount_type, discount_value, min_order || 0, max_discount || null, max_uses || null, start_date || null, end_date || null]
  );
  return { id: result.insertId };
};

const update = async (id, data) => {
  const { code, description, discount_type, discount_value, min_order, max_discount, max_uses, start_date, end_date, is_active } = data;
  await pool.query(
    `UPDATE promotions SET code=?, description=?, discount_type=?, discount_value=?,
      min_order=?, max_discount=?, max_uses=?, start_date=?, end_date=?, is_active=?
     WHERE id=?`,
    [code, description || null, discount_type, discount_value, min_order || 0, max_discount || null, max_uses || null, start_date || null, end_date || null, is_active ?? 1, id]
  );
};

const remove = async (id) => {
  await pool.query('DELETE FROM promotions WHERE id = ?', [id]);
};

/**
 * Validate promotion code
 * Business rules:
 * - Mã giảm giá hết hạn không được áp dụng
 * - Mã giảm giá không được dùng quá max_uses
 */
const validate = async (code, subtotal) => {
  const [rows] = await pool.query('SELECT * FROM promotions WHERE code = ? AND is_active = 1', [code]);
  if (rows.length === 0) throw { statusCode: 404, message: 'Mã khuyến mãi không tồn tại hoặc đã bị khóa' };

  const promo = rows[0];
  const now = new Date();

  if (promo.start_date && new Date(promo.start_date) > now) {
    throw { statusCode: 400, message: 'Mã khuyến mãi chưa đến ngày sử dụng' };
  }
  if (promo.end_date && new Date(promo.end_date) < now) {
    throw { statusCode: 400, message: 'Mã khuyến mãi đã hết hạn' };
  }
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    throw { statusCode: 400, message: 'Mã khuyến mãi đã hết lượt sử dụng' };
  }
  if (promo.min_order && subtotal < promo.min_order) {
    throw { statusCode: 400, message: `Đơn hàng tối thiểu ${promo.min_order} để sử dụng mã này` };
  }

  let discount = 0;
  if (promo.discount_type === 'percent') {
    discount = subtotal * (promo.discount_value / 100);
    if (promo.max_discount && discount > promo.max_discount) discount = promo.max_discount;
  } else {
    discount = promo.discount_value;
  }

  return { promotion: promo, discount_amount: discount };
};

module.exports = { getAll, create, update, remove, validate };
