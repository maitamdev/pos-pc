# Computer POS System

Hệ thống POS Web quản lý cửa hàng linh kiện máy tính.

## Công nghệ

- **Frontend:** ReactJS + Vite + Tailwind CSS + React Router DOM + Axios + Recharts + Lucide React
- **Backend:** NodeJS + ExpressJS + MySQL2 + JWT + bcryptjs + dotenv + cors + express-validator + multer
- **Database:** MySQL 8

## Cài đặt

### 1. Database

```bash
# Đăng nhập MySQL và chạy:
mysql -u root -p < database/schema.sql
mysql -u root -p computer_pos < database/seed.sql
```

### 2. Backend

```bash
cd backend
npm install
# Cấu hình .env (copy từ .env.example)
npm run dev
```

Server chạy tại: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
# Cấu hình .env (copy từ .env.example)
npm run dev
```

App chạy tại: `http://localhost:3000`

## Tài khoản mặc định

| Username | Password   | Vai trò |
|----------|------------|---------|
| admin    | 12345678   | Admin   |
| manager  | 12345678   | Manager |
| staff    | 12345678   | Staff   |

## Cấu trúc thư mục

```
computer-pos-system/
├── database/
│   ├── schema.sql          # Tạo bảng
│   └── seed.sql            # Dữ liệu mẫu
├── backend/
│   ├── src/
│   │   ├── config/         # Cấu hình DB
│   │   ├── controllers/    # Xử lý request
│   │   ├── routes/         # Định tuyến API
│   │   ├── services/       # Business logic
│   │   ├── middlewares/     # Auth, validate, error
│   │   ├── validators/     # Kiểm tra dữ liệu
│   │   ├── utils/          # Helpers
│   │   ├── app.js          # Express app
│   │   └── server.js       # Server entry
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── context/        # Auth, Cart, Toast context
    │   ├── layouts/        # MainLayout
    │   ├── pages/          # All pages
    │   ├── services/       # Axios instance
    │   ├── App.jsx
    │   └── main.jsx
    └── .env
```

## API Endpoints

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `PUT /api/auth/change-password`

### Users (Admin only)
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Categories
- `GET /api/categories`
- `POST /api/categories` (Admin)
- `PUT /api/categories/:id` (Admin)
- `DELETE /api/categories/:id` (Admin)

### Suppliers
- `GET /api/suppliers`
- `POST /api/suppliers` (Admin/Manager)
- `PUT /api/suppliers/:id` (Admin/Manager)
- `DELETE /api/suppliers/:id` (Admin)

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/low-stock`
- `POST /api/products` (Admin/Manager)
- `PUT /api/products/:id` (Admin/Manager)
- `DELETE /api/products/:id` (Admin)

### Customers
- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `GET /api/customers/:id/orders`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/cancel`

### Inventory
- `GET /api/inventory/transactions`
- `POST /api/inventory/import` (Admin/Manager)
- `POST /api/inventory/adjust` (Admin/Manager)
- `GET /api/inventory/low-stock-alerts`
- `PUT /api/inventory/alerts/:id/resolve` (Admin/Manager)

### Promotions
- `GET /api/promotions`
- `POST /api/promotions` (Admin)
- `PUT /api/promotions/:id` (Admin)
- `DELETE /api/promotions/:id` (Admin)
- `POST /api/promotions/validate`

### Reports
- `GET /api/reports/dashboard`
- `GET /api/reports/revenue`
- `GET /api/reports/top-products`
- `GET /api/reports/low-stock`
- `GET /api/reports/employee-revenue` (Admin)
- `GET /api/reports/category-revenue`

### AI Build PC
- `POST /api/ai/build-pc`
- `POST /api/ai/check-compatibility`
- `GET /api/ai/suggest-compatible-products/:productId`
