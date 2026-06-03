-- Migration v3: Barcode, Payment Methods, Notifications, Backup
-- Run: mysql -u root -p computer_pos_db < migration_v3.sql

-- Add barcode column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(50) UNIQUE AFTER sku;

-- Add payment_method column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash' AFTER discount;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(15,2) DEFAULT 0 AFTER payment_method;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS change_amount DECIMAL(15,2) DEFAULT 0 AFTER amount_paid;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read TINYINT(1) DEFAULT 0,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Shift management (cash register)
CREATE TABLE IF NOT EXISTS shifts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  opening_cash DECIMAL(15,2) DEFAULT 0,
  closing_cash DECIMAL(15,2) DEFAULT 0,
  total_cash DECIMAL(15,2) DEFAULT 0,
  total_card DECIMAL(15,2) DEFAULT 0,
  total_transfer DECIMAL(15,2) DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add shift_id to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shift_id INT AFTER user_id;
ALTER TABLE orders ADD FOREIGN KEY IF NOT EXISTS (shift_id) REFERENCES shifts(id);

-- Create index for barcode search
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_shifts_user ON shifts(user_id);

SELECT 'Migration v3 completed!' as status;