-- ============================================================
-- Computer POS System - Seed Data
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

-- Categories
INSERT INTO categories (name, description) VALUES
('CPU',            'Bộ vi xử lý'),
('Mainboard',      'Bo mạch chủ'),
('RAM',            'Bộ nhớ trong'),
('VGA',            'Card đồ họa'),
('SSD',            'Ổ cứng thể rắn'),
('HDD',            'Ổ cứng cơ'),
('PSU',            'Nguồn máy tính'),
('Case',           'Vỏ máy tính'),
('Cooler',         'Tản nhiệt'),
('Monitor',        'Màn hình'),
('Keyboard',       'Bàn phím'),
('Mouse',          'Chuột');

-- Suppliers
INSERT INTO suppliers (name, contact, phone, email, address) VALUES
('Intel Vietnam',       'Nguyễn A', '0912000001', 'intel@distributor.vn',    'TP.HCM'),
('AMD Vietnam',         'Trần B',   '0912000002', 'amd@distributor.vn',      'TP.HCM'),
('ASUS Vietnam',        'Lê C',     '0912000003', 'asus@distributor.vn',     'Hà Nội'),
('Gigabyte Vietnam',    'Phạm D',   '0912000004', 'gigabyte@distributor.vn', 'TP.HCM'),
('Samsung Vietnam',     'Hoàng E',  '0912000005', 'samsung@distributor.vn',  'Bắc Ninh'),
('Corsair Vietnam',     'Vũ F',     '0912000006', 'corsair@distributor.vn',  'TP.HCM'),
('Kingston Vietnam',    'Đặng G',   '0912000007', 'kingston@distributor.vn', 'Hà Nội'),
('MSI Vietnam',         'Bùi H',    '0912000008', 'msi@distributor.vn',      'TP.HCM');

-- Products  (component_type, socket, ram_type, power_watt for AI compatibility)
INSERT INTO products (sku, name, description, category_id, supplier_id, cost_price, selling_price, stock, min_stock_level, component_type, socket, ram_type, power_watt) VALUES
-- CPU
('CPU-I5-14600K',  'Intel Core i5-14600K',        '14th Gen, 14C/20T',             1, 1, 6500000,  7990000,  25, 5, 'cpu', 'LGA1700', NULL,  NULL),
('CPU-I7-14700K',  'Intel Core i7-14700K',        '14th Gen, 20C/28T',             1, 1, 9500000,  11490000, 15, 5, 'cpu', 'LGA1700', NULL,  NULL),
('CPU-I9-14900K',  'Intel Core i9-14900K',        '14th Gen, 24C/32T',             1, 1, 13500000, 16490000, 8,  3, 'cpu', 'LGA1700', NULL,  NULL),
('CPU-R5-7600X',   'AMD Ryzen 5 7600X',           'Zen 4, 6C/12T',                 1, 2, 5200000,  6490000,  20, 5, 'cpu', 'AM5',     NULL,  NULL),
('CPU-R7-7800X3D', 'AMD Ryzen 7 7800X3D',         'Zen 4, 8C/16T, 3D V-Cache',    1, 2, 9200000,  10990000, 10, 3, 'cpu', 'AM5',     NULL,  NULL),
('CPU-R9-7950X',   'AMD Ryzen 9 7950X',           'Zen 4, 16C/32T',                1, 2, 14000000, 17490000, 5,  3, 'cpu', 'AM5',     NULL,  NULL),
-- Mainboard
('MB-Z790-A',      'ASUS ROG Strix Z790-A Gaming', 'LGA1700, DDR5, WiFi 6E',      2, 3, 5800000,  7290000,  12, 3, 'mainboard', 'LGA1700', 'DDR5', NULL),
('MB-Z790-E',      'ASUS ROG Strix Z790-E Gaming', 'LGA1700, DDR5, WiFi 6E',      2, 3, 7500000,  9490000,  8,  3, 'mainboard', 'LGA1700', 'DDR5', NULL),
('MB-X670E-A',     'ASUS ROG Strix X670E-A',       'AM5, DDR5, WiFi 6E',          2, 3, 6200000,  7990000,  10, 3, 'mainboard', 'AM5',     'DDR5', NULL),
('MB-B650M',       'Gigabyte B650M Aorus Elite',   'AM5, DDR5, mATX',             2, 4, 3200000,  4190000,  18, 5, 'mainboard', 'AM5',     'DDR5', NULL),
('MB-B760M',       'MSI MAG B760M Mortar WiFi',    'LGA1700, DDR5, mATX',         2, 8, 3500000,  4490000,  15, 5, 'mainboard', 'LGA1700', 'DDR5', NULL),
-- RAM
('RAM-DDR5-32G',   'Corsair Vengeance DDR5 32GB',  '2x16GB, 5600MHz',             3, 6, 2800000,  3490000,  30, 5, 'ram', NULL, 'DDR5', NULL),
('RAM-DDR5-16G',   'Kingston Fury Beast DDR5 16GB','1x16GB, 5200MHz',             3, 7, 1200000,  1590000,  40, 10,'ram', NULL, 'DDR5', NULL),
('RAM-DDR5-64G',   'G.Skill Trident Z5 64GB',      '2x32GB, 6000MHz',            3, 6, 5500000,  6990000,  10, 3, 'ram', NULL, 'DDR5', NULL),
-- VGA
('VGA-RTX4060',    'ASUS Dual RTX 4060 OC 8GB',    'GDDR6, 128-bit',              4, 3, 7200000,  8990000,  15, 3, 'vga', NULL, NULL, 115),
('VGA-RTX4070S',   'Gigabyte RTX 4070 Super 12GB',  'GDDR6X, 192-bit',            4, 4, 13500000, 16490000, 10, 3, 'vga', NULL, NULL, 220),
('VGA-RTX4080S',   'MSI RTX 4080 Super 16GB',       'GDDR6X, 256-bit',            4, 8, 22000000, 27490000, 5,  2, 'vga', NULL, NULL, 320),
('VGA-RTX4090',    'ASUS ROG RTX 4090 24GB',        'GDDR6X, 384-bit',            4, 3, 38000000, 45990000, 3,  1, 'vga', NULL, NULL, 450),
('VGA-RX7800XT',   'Sapphire RX 7800 XT 16GB',      'GDDR6, 256-bit',             4, 2, 11000000, 13990000, 8,  3, 'vga', NULL, NULL, 263),
-- SSD
('SSD-1TB-980',    'Samsung 980 Pro 1TB',           'NVMe M.2, 7000MB/s',          5, 5, 2200000,  2890000,  25, 5, 'ssd', NULL, NULL, NULL),
('SSD-2TB-990',    'Samsung 990 Pro 2TB',           'NVMe M.2, 7450MB/s',          5, 5, 4200000,  5490000,  15, 3, 'ssd', NULL, NULL, NULL),
('SSD-500G',       'Kingston NV2 500GB',             'NVMe M.2, 3500MB/s',         5, 7, 850000,   1190000,  30, 10,'ssd', NULL, NULL, NULL),
-- HDD
('HDD-2TB',        'Seagate Barracuda 2TB',          '3.5", 7200RPM',              6, 5, 1200000,  1590000,  20, 5, 'hdd', NULL, NULL, NULL),
-- PSU
('PSU-750W',       'Corsair RM750x 750W',            '80+ Gold, Full Modular',     7, 6, 2200000,  2890000,  15, 3, 'psu', NULL, NULL, 750),
('PSU-850W',       'Corsair RM850x 850W',            '80+ Gold, Full Modular',     7, 6, 2800000,  3590000,  12, 3, 'psu', NULL, NULL, 850),
('PSU-1000W',      'ASUS ROG STRIX 1000W',           '80+ Gold, Full Modular',     7, 3, 3800000,  4890000,  8,  2, 'psu', NULL, NULL, 1000),
('PSU-1200W',      'Corsair HX1200 1200W',           '80+ Platinum, Full Modular', 7, 6, 5200000,  6690000,  5,  2, 'psu', NULL, NULL, 1200),
-- Case
('CASE-4000D',     'Corsair 4000D Airflow',           'Mid Tower, ATX',             8, 6, 1800000,  2390000,  20, 5, 'case', NULL, NULL, NULL),
('CASE-O11D',      'Lian Li O11 Dynamic',             'Mid Tower, ATX',             8, 3, 2500000,  3290000,  12, 3, 'case', NULL, NULL, NULL),
-- Cooler
('COOL-NH-D15',    'Noctua NH-D15',                   'Tower, 2x 140mm fan',       9, 3, 2000000,  2590000,  15, 3, 'cooler', NULL, NULL, NULL),
('COOL-AIO-360',   'Corsair iCUE H150i Elite 360mm',  'AIO Liquid Cooler',         9, 6, 3200000,  4190000,  10, 3, 'cooler', NULL, NULL, NULL),
-- Monitor
('MON-27-2K',      'ASUS ProArt PA278QV 27"',          '2K IPS, 75Hz',             10, 3, 4500000,  5790000,  10, 3, NULL, NULL, NULL, NULL),
('MON-27-4K',      'LG 27UK850-W 27"',                 '4K IPS, HDR10',            10, 5, 6500000,  8290000,  6,  2, NULL, NULL, NULL, NULL),
-- Keyboard
('KB-MECH-01',     'Corsair K70 RGB MK.2',             'Mechanical, Cherry MX',    11, 6, 2500000,  3290000,  15, 5, NULL, NULL, NULL, NULL),
('KB-MECH-02',     'Logitech G Pro X',                  'Mechanical, GX Switch',    11, 3, 1800000,  2390000,  20, 5, NULL, NULL, NULL, NULL),
-- Mouse
('MOUSE-GPRO',     'Logitech G Pro X Superlight',       'Wireless, 63g',            12, 3, 2200000,  2890000,  18, 5, NULL, NULL, NULL, NULL),
('MOUSE-DAV3',     'Razer DeathAdder V3',                'Wired, 59g, Focus Pro',    12, 3, 1500000,  1990000,  22, 5, NULL, NULL, NULL, NULL);

-- Customers
INSERT INTO customers (name, phone, email, address, loyalty_points) VALUES
('Nguyễn Văn An',     '0988111222', 'an@gmail.com',     '123 Lê Lợi, Q1, TP.HCM',    500),
('Trần Thị Bình',     '0988333444', 'binh@gmail.com',   '456 Nguyễn Huệ, Q1, TP.HCM', 320),
('Lê Hoàng Dũng',     '0988555666', 'dung@gmail.com',   '789 Cách Mạng T8, Q3, TP.HCM', 150),
('Phạm Minh Châu',    '0988777888', 'chau@gmail.com',   '321 Võ Văn Tần, Q3, TP.HCM',  0),
('Hoàng Văn Giáp',    '0988999000', 'giap@gmail.com',   '654 Điện Biên Phủ, Bình Thạnh', 800);

-- Promotions
INSERT INTO promotions (code, description, discount_type, discount_value, min_order, max_discount, max_uses, used_count, start_date, end_date) VALUES
('WELCOME10',  'Giảm 10% cho khách mới',           'percent', 10, 500000,  500000,  100, 12, '2026-01-01', '2026-12-31'),
('SAVE50K',    'Giảm 50K cho đơn từ 1 triệu',      'fixed',   50000, 1000000, NULL,   200, 35, '2026-01-01', '2026-12-31'),
('PCBUILD15',  'Giảm 15% khi build PC',            'percent', 15, 5000000, 2000000, 50,  8,  '2026-01-01', '2026-06-30'),
('EXPIRED20',  'Mã đã hết hạn',                     'percent', 20, 0,       1000000, 100, 100,'2025-01-01', '2025-12-31');
