const pool = require('../config/database');

const getDashboard = async () => {
  const today = new Date().toISOString().split('T')[0];

  // Today's revenue
  const [todayRev] = await pool.query(
    "SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders FROM orders WHERE DATE(created_at) = ? AND status = 'completed'",
    [today]
  );

  // Total customers
  const [custCount] = await pool.query('SELECT COUNT(*) as total FROM customers');

  // Total products
  const [prodCount] = await pool.query('SELECT COUNT(*) as total FROM products WHERE is_active = 1');

  // Revenue last 7 days
  const [dailyRevenue] = await pool.query(
    `SELECT DATE(created_at) as date, COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders
     FROM orders WHERE status = 'completed' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
     GROUP BY DATE(created_at) ORDER BY date`
  );

  // Top selling products (last 30 days)
  const [topProducts] = await pool.query(
    `SELECT od.product_id, od.product_name, SUM(od.quantity) as total_sold, SUM(od.subtotal) as total_revenue
     FROM order_details od
     JOIN orders o ON od.order_id = o.id
     WHERE o.status = 'completed' AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY od.product_id, od.product_name
     ORDER BY total_sold DESC LIMIT 10`
  );

  // Low stock products
  const [lowStock] = await pool.query(
    `SELECT id, sku, name, stock, min_stock_level
     FROM products WHERE is_active = 1 AND stock <= min_stock_level
     ORDER BY stock ASC LIMIT 10`
  );

  return {
    today_revenue: todayRev[0].revenue,
    today_orders: todayRev[0].orders,
    total_customers: custCount[0].total,
    total_products: prodCount[0].total,
    daily_revenue: dailyRevenue,
    top_products: topProducts,
    low_stock: lowStock,
  };
};

const getRevenue = async (query = {}) => {
  let sql = `SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
             FROM orders WHERE status = 'completed'`;
  const params = [];
  if (query.date_from) { sql += ' AND DATE(created_at) >= ?'; params.push(query.date_from); }
  if (query.date_to) { sql += ' AND DATE(created_at) <= ?'; params.push(query.date_to); }
  sql += ' GROUP BY DATE(created_at) ORDER BY date';
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getTopProducts = async (query = {}) => {
  let sql = `SELECT od.product_id, od.product_name, SUM(od.quantity) as total_sold, SUM(od.subtotal) as total_revenue
             FROM order_details od JOIN orders o ON od.order_id = o.id
             WHERE o.status = 'completed'`;
  const params = [];
  if (query.date_from) { sql += ' AND DATE(o.created_at) >= ?'; params.push(query.date_from); }
  if (query.date_to) { sql += ' AND DATE(o.created_at) <= ?'; params.push(query.date_to); }
  sql += ' GROUP BY od.product_id, od.product_name ORDER BY total_sold DESC LIMIT 20';
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getEmployeeRevenue = async (query = {}) => {
  let sql = `SELECT u.id, u.full_name, COUNT(o.id) as total_orders, SUM(o.total) as total_revenue
             FROM orders o JOIN users u ON o.user_id = u.id
             WHERE o.status = 'completed'`;
  const params = [];
  if (query.date_from) { sql += ' AND DATE(o.created_at) >= ?'; params.push(query.date_from); }
  if (query.date_to) { sql += ' AND DATE(o.created_at) <= ?'; params.push(query.date_to); }
  sql += ' GROUP BY u.id, u.full_name ORDER BY total_revenue DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getCategoryRevenue = async (query = {}) => {
  let sql = `SELECT c.name as category, SUM(od.quantity) as total_sold, SUM(od.subtotal) as total_revenue
             FROM order_details od
             JOIN orders o ON od.order_id = o.id
             JOIN products p ON od.product_id = p.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE o.status = 'completed'`;
  const params = [];
  if (query.date_from) { sql += ' AND DATE(o.created_at) >= ?'; params.push(query.date_from); }
  if (query.date_to) { sql += ' AND DATE(o.created_at) <= ?'; params.push(query.date_to); }
  sql += ' GROUP BY c.id, c.name ORDER BY total_revenue DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getLowStockReport = async () => {
  const [rows] = await pool.query(
    `SELECT p.id, p.sku, p.name, p.stock, p.min_stock_level, p.cost_price, p.selling_price,
            c.name as category_name
     FROM products p LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.is_active = 1 AND p.stock <= p.min_stock_level
     ORDER BY p.stock ASC`
  );
  return rows;
};

const getProfitReport = async (query = {}) => {
  let sql = `SELECT DATE(o.created_at) as date,
             SUM(od.subtotal) as revenue,
             SUM(od.quantity * p.cost_price) as cost,
             SUM(od.subtotal) - SUM(od.quantity * p.cost_price) as profit,
             COUNT(DISTINCT o.id) as orders
             FROM orders o
             JOIN order_details od ON o.id = od.order_id
             JOIN products p ON od.product_id = p.id
             WHERE o.status = 'completed'`;
  const params = [];
  if (query.date_from) { sql += ' AND DATE(o.created_at) >= ?'; params.push(query.date_from); }
  if (query.date_to) { sql += ' AND DATE(o.created_at) <= ?'; params.push(query.date_to); }
  sql += ' GROUP BY DATE(o.created_at) ORDER BY date';
  const [rows] = await pool.query(sql, params);

  // Totals
  const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);
  const totalCost = rows.reduce((s, r) => s + Number(r.cost), 0);
  const totalProfit = totalRevenue - totalCost;

  return { daily: rows, summary: { total_revenue: totalRevenue, total_cost: totalCost, total_profit: totalProfit } };
};

const getExportData = async (query = {}) => {
  let sql = `SELECT o.order_code, o.created_at as date,
             c.name as customer_name, c.phone as customer_phone,
             u.full_name as staff_name,
             od.product_name, od.quantity, od.unit_price, od.subtotal,
             p.cost_price, (od.quantity * p.cost_price) as cost_total,
             o.payment_method, o.status,
             o.subtotal, o.discount_amount, o.total
             FROM orders o
             JOIN order_details od ON o.id = od.order_id
             JOIN products p ON od.product_id = p.id
             JOIN users u ON o.user_id = u.id
             LEFT JOIN customers c ON o.customer_id = c.id
             WHERE 1=1`;
  const params = [];
  if (query.date_from) { sql += ' AND DATE(o.created_at) >= ?'; params.push(query.date_from); }
  if (query.date_to) { sql += ' AND DATE(o.created_at) <= ?'; params.push(query.date_to); }
  if (query.status) { sql += ' AND o.status = ?'; params.push(query.status); }
  sql += ' ORDER BY o.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getRFMAnalysis = async () => {
  // Recency, Frequency, Monetary analysis for customers
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.phone, c.email, c.loyalty_points,
            DATEDIFF(CURDATE(), MAX(o.created_at)) as recency_days,
            COUNT(o.id) as frequency,
            SUM(o.total) as monetary,
            CASE
              WHEN DATEDIFF(CURDATE(), MAX(o.created_at)) <= 30 AND COUNT(o.id) >= 5 AND SUM(o.total) >= 5000000 THEN 'VIP'
              WHEN DATEDIFF(CURDATE(), MAX(o.created_at)) <= 30 AND COUNT(o.id) >= 3 THEN 'Thân thiết'
              WHEN DATEDIFF(CURDATE(), MAX(o.created_at)) <= 90 THEN 'Tiềm năng'
              WHEN DATEDIFF(CURDATE(), MAX(o.created_at)) <= 180 THEN 'Cần chăm sóc'
              ELSE 'Nguy hiểm'
            END as segment
     FROM customers c
     LEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'completed'
     GROUP BY c.id, c.name, c.phone, c.email, c.loyalty_points
     ORDER BY monetary DESC`
  );

  const segments = { VIP: 0, 'Thân thiết': 0, 'Tiềm năng': 0, 'Cần chăm sóc': 0, 'Nguy hiểm': 0 };
  rows.forEach(r => { if (segments[r.segment] !== undefined) segments[r.segment]++; });

  return { customers: rows, segments };
};

const getInventoryAging = async () => {
  // Products that haven't been sold in X days
  const [rows] = await pool.query(
    `SELECT p.id, p.sku, p.name, p.stock, p.cost_price, p.selling_price,
            (p.stock * p.cost_price) as stock_value,
            MAX(o.created_at) as last_sold_date,
            DATEDIFF(CURDATE(), MAX(o.created_at)) as days_since_last_sold,
            CASE
              WHEN MAX(o.created_at) IS NULL THEN 'Chưa bán'
              WHEN DATEDIFF(CURDATE(), MAX(o.created_at)) <= 30 THEN 'Tốt'
              WHEN DATEDIFF(CURDATE(), MAX(o.created_at)) <= 90 THEN 'Chậm'
              WHEN DATEDIFF(CURDATE(), MAX(o.created_at)) <= 180 THEN 'Tồn lâu'
              ELSE 'Cần xử lý'
            END as aging_status
     FROM products p
     LEFT JOIN order_details od ON p.id = od.product_id
     LEFT JOIN orders o ON od.order_id = o.id AND o.status = 'completed'
     WHERE p.is_active = 1 AND p.stock > 0
     GROUP BY p.id, p.sku, p.name, p.stock, p.cost_price, p.selling_price
     ORDER BY days_since_last_sold DESC`
  );

  const totalValue = rows.reduce((s, r) => s + Number(r.stock_value), 0);
  return { products: rows, total_stock_value: totalValue };
};

const getPaymentMethodReport = async (query = {}) => {
  let sql = `SELECT payment_method, COUNT(*) as orders, SUM(total) as revenue
             FROM orders WHERE status = 'completed'`;
  const params = [];
  if (query.date_from) { sql += ' AND DATE(created_at) >= ?'; params.push(query.date_from); }
  if (query.date_to) { sql += ' AND DATE(created_at) <= ?'; params.push(query.date_to); }
  sql += ' GROUP BY payment_method ORDER BY revenue DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
};

module.exports = { getDashboard, getRevenue, getTopProducts, getEmployeeRevenue, getCategoryRevenue, getLowStockReport, getProfitReport, getExportData, getRFMAnalysis, getInventoryAging, getPaymentMethodReport };
