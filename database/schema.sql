-- ============================================================
-- Computer POS System - Database Schema
-- MySQL 8.x
-- ============================================================

CREATE DATABASE IF NOT EXISTS computer_pos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE computer_pos;

-- ============================================================
-- 1. Roles
-- ============================================================
CREATE TABLE roles (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50) NOT NULL UNIQUE,   -- admin | manager | staff
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. Users
-- ============================================================
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,       -- bcrypt hash
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(150),
  phone         VARCHAR(20),
  role_id       INT NOT NULL,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- ============================================================
-- 3. Categories
-- ============================================================
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  is_active   TINYINT(1) DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 4. Suppliers
-- ============================================================
CREATE TABLE suppliers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  contact     VARCHAR(150),
  phone       VARCHAR(20),
  email       VARCHAR(150),
  address     TEXT,
  is_active   TINYINT(1) DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 5. Products
-- ============================================================
CREATE TABLE products (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  sku              VARCHAR(100) NOT NULL UNIQUE,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  category_id      INT,
  supplier_id      INT,
  cost_price       DECIMAL(12,2) NOT NULL DEFAULT 0,   -- giá nhập
  selling_price    DECIMAL(12,2) NOT NULL DEFAULT 0,    -- giá bán
  stock            INT NOT NULL DEFAULT 0,               -- tồn kho hiện tại
  min_stock_level  INT NOT NULL DEFAULT 5,               -- ngưỡng cảnh báo
  image            VARCHAR(255),
  -- Compatibility fields for AI Build PC
  component_type   VARCHAR(50),        -- cpu | mainboard | ram | vga | psu | ssd | hdd | case | cooler
  socket           VARCHAR(50),        -- LGA1700, AM5, ...
  ram_type         VARCHAR(20),        -- DDR4, DDR5
  power_watt       INT,                -- công suất PSU hoặc VGA
  is_active        TINYINT(1) DEFAULT 1,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 6. Customers
-- ============================================================
CREATE TABLE customers (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  phone          VARCHAR(20),
  email          VARCHAR(150),
  address        TEXT,
  loyalty_points INT NOT NULL DEFAULT 0,    -- tích điểm
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 7. Promotions
-- ============================================================
CREATE TABLE promotions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(50) NOT NULL UNIQUE,
  description  TEXT,
  discount_type  ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
  discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_order      DECIMAL(12,2) DEFAULT 0,
  max_discount   DECIMAL(12,2),           -- giới hạn giảm tối đa (percent only)
  max_uses       INT,                     -- NULL = unlimited
  used_count     INT DEFAULT 0,
  start_date     DATE,
  end_date       DATE,
  is_active      TINYINT(1) DEFAULT 1,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 8. Orders
-- ============================================================
CREATE TABLE orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_code      VARCHAR(50) NOT NULL UNIQUE,
  customer_id     INT,
  user_id         INT NOT NULL,             -- nhân viên tạo đơn
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  promotion_id    INT,
  total           DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method  ENUM('cash','banking','qr','card') NOT NULL DEFAULT 'cash',
  status          ENUM('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id)      REFERENCES users(id),
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 9. Order Details
-- ============================================================
CREATE TABLE order_details (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  product_id   INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,       -- snapshot tên SP tại thời điểm bán
  quantity     INT NOT NULL,
  unit_price   DECIMAL(12,2) NOT NULL,      -- snapshot giá bán
  subtotal     DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- ============================================================
-- 10. Stock Transactions  (nhập / xuất / điều chỉnh)
-- ============================================================
CREATE TABLE stock_transactions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  product_id   INT NOT NULL,
  type         ENUM('import','export','adjustment') NOT NULL,
  quantity     INT NOT NULL,               -- dương = nhập, âm = xuất
  reference    VARCHAR(255),               -- ghi chú / mã đơn
  user_id      INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id)    REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================================
-- 11. Stock Alerts
-- ============================================================
CREATE TABLE stock_alerts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  product_id   INT NOT NULL,
  current_stock INT NOT NULL,
  min_stock     INT NOT NULL,
  status       ENUM('active','resolved') NOT NULL DEFAULT 'active',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at  TIMESTAMP NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- ============================================================
-- 12. Loyalty Points (history log)
-- ============================================================
CREATE TABLE loyalty_points (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  customer_id  INT NOT NULL,
  order_id     INT,
  points       INT NOT NULL,               -- dương = cộng, âm = trừ
  type         ENUM('earn','redeem','adjust') NOT NULL,
  description  VARCHAR(255),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_sku      ON products(sku);
CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_orders_customer   ON orders(customer_id);
CREATE INDEX idx_orders_created    ON orders(created_at);
CREATE INDEX idx_order_details_order   ON order_details(order_id);
CREATE INDEX idx_order_details_product ON order_details(product_id);
CREATE INDEX idx_stock_txn_product ON stock_transactions(product_id);
