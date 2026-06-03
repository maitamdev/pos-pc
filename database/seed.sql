-- ============================================================
-- Computer POS System - Essential Seed Data (Empty Database)
-- Password for all accounts: 12345678 (bcrypt hash)
-- ============================================================

USE computer_pos;

-- Roles
INSERT INTO roles (name) VALUES ('admin'), ('manager'), ('staff');

-- Users  (bcrypt hash of "12345678")
INSERT INTO users (username, password, full_name, email, phone, role_id) VALUES
('admin',   '$2a$10$DhcfKKwlxE5HErMKMr8bPugvsPA9k6J.dnxMMR/fQIk4BU32QtkL.', 'System Admin',  'admin@pos.com',   '0901000001', 1),
('manager', '$2a$10$DhcfKKwlxE5HErMKMr8bPugvsPA9k6J.dnxMMR/fQIk4BU32QtkL.', 'Store Manager', 'manager@pos.com', '0901000002', 2),
('staff',   '$2a$10$DhcfKKwlxE5HErMKMr8bPugvsPA9k6J.dnxMMR/fQIk4BU32QtkL.', 'Sale Staff',    'staff@pos.com',   '0901000003', 3);
