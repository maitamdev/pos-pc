-- Migration V2: Purchase Orders, Returns, Warranties, Audit Logs, Settings
USE computer_pos;

-- ============================================================
-- 13. Purchase Orders (Đơn nhập hàng)
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  po_code         VARCHAR(50) NOT NULL UNIQUE,
  supplier_id     INT NOT NULL,
  user_id         INT NOT NULL,
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
  total           DECIMAL(12,2) NOT NULL DEFAULT 0,
  status          ENUM('draft','ordered','received','cancelled') NOT NULL DEFAULT 'draft',
  notes           TEXT,
  expected_date   DATE,
  received_date   DATE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (user_id)     REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS purchase_order_details (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  po_id        INT NOT NULL,
  product_id   INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity     INT NOT NULL,
  unit_cost    DECIMAL(12,2) NOT NULL,
  subtotal     DECIMAL(12,2) NOT NULL,
  received_qty INT DEFAULT 0,
  FOREIGN KEY (po_id)      REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- ============================================================
-- 14. Returns (Trả hàng / Hoàn tiền)
-- ============================================================
CREATE TABLE IF NOT EXISTS returns (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  return_code     VARCHAR(50) NOT NULL UNIQUE,
  order_id        INT NOT NULL,
  customer_id     INT,
  user_id         INT NOT NULL,
  total_refund    DECIMAL(12,2) NOT NULL DEFAULT 0,
  reason          TEXT,
  status          ENUM('pending','approved','completed','rejected') NOT NULL DEFAULT 'pending',
  refund_method   ENUM('cash','banking','card','store_credit') NOT NULL DEFAULT 'cash',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)    REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id)     REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS return_details (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  return_id    INT NOT NULL,
  product_id   INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity     INT NOT NULL,
  unit_price   DECIMAL(12,2) NOT NULL,
  subtotal     DECIMAL(12,2) NOT NULL,
  reason       VARCHAR(255),
  FOREIGN KEY (return_id)   REFERENCES returns(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id)  REFERENCES products(id)
) ENGINE=InnoDB;

-- ============================================================
-- 15. Warranties (Bảo hành)
-- ============================================================
CREATE TABLE IF NOT EXISTS warranties (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  warranty_code   VARCHAR(50) NOT NULL UNIQUE,
  order_id        INT,
  product_id      INT NOT NULL,
  customer_id     INT NOT NULL,
  serial_number   VARCHAR(100),
  warranty_months INT NOT NULL DEFAULT 12,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  status          ENUM('active','expired','claimed','replaced') NOT NULL DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id)  REFERENCES products(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB;

-- ============================================================
-- 16. Audit Logs (Nhật ký hoạt động)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT,
  action       VARCHAR(50) NOT NULL,       -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT...
  entity       VARCHAR(50) NOT NULL,       -- order, product, customer...
  entity_id    INT,
  details      JSON,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 17. System Settings
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  setting_key  VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  description  VARCHAR(255),
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('store_name', 'Computer Shop', 'Tên cửa hàng'),
  ('store_address', '123 Nguyễn Huệ, Q.1, TP.HCM', 'Địa chỉ cửa hàng'),
  ('store_phone', '0901 234 567', 'Số điện thoại'),
  ('store_email', 'info@computershop.vn', 'Email cửa hàng'),
  ('tax_rate', '10', 'Thuế VAT (%)'),
  ('currency', 'VND', 'Đơn vị tiền tệ'),
  ('receipt_header', '💻 COMPUTER SHOP', 'Tiêu đề hóa đơn'),
  ('receipt_footer', 'Cảm ơn quý khách đã mua hàng!', 'Chân hóa đơn'),
  ('loyalty_rate', '1000', 'VND/điểm tích lũy'),
  ('low_stock_threshold', '5', 'Ngưỡng cảnh báo tồn kho mặc định');

-- Indexes
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_user ON purchase_orders(user_id);
CREATE INDEX idx_po_created ON purchase_orders(created_at);
CREATE INDEX idx_return_order ON returns(order_id);
CREATE INDEX idx_return_created ON returns(created_at);
CREATE INDEX idx_warranty_product ON warranties(product_id);
CREATE INDEX idx_warranty_customer ON warranties(customer_id);
CREATE INDEX idx_warranty_status ON warranties(status);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);