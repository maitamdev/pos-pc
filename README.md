# Hệ thống Quản lý Cửa hàng Máy tính (Computer POS System)

Đây là một hệ thống Quản lý Bán hàng (POS) toàn diện dành riêng cho cửa hàng linh kiện máy tính, được xây dựng với các công nghệ hiện đại nhất. Hệ thống hỗ trợ bán hàng, quản lý kho, nhập hàng, đổi trả, bảo hành, chăm sóc khách hàng và đặc biệt tích hợp AI để tư vấn xây dựng cấu hình PC (Build PC).

## 🚀 Công nghệ sử dụng
- **Frontend:** ReactJS + Vite + Tailwind CSS + React Router DOM + Axios + Recharts
- **Backend:** NodeJS + ExpressJS + MySQL2 + JWT + bcryptjs
- **Database:** MySQL 8+

---

## 📋 Yêu cầu hệ thống (Prerequisites)
Để cài đặt và chạy dự án này, máy tính của bạn cần có sẵn:
1. **Node.js** (Phiên bản 18.x hoặc mới hơn)
2. **MySQL** (Phiên bản 8.x)
3. **Git** (Để clone source code)

---

## 🛠️ Hướng dẫn Cài đặt & Chạy dự án (Từng bước chi tiết)

### Bước 1: Clone dự án về máy
Mở Terminal/Command Prompt và chạy:
```bash
git clone https://github.com/maitamdev/pos-pc.git
cd pos-pc
```

### Bước 2: Thiết lập Cơ sở dữ liệu (Database)
Hệ thống yêu cầu một cơ sở dữ liệu MySQL trống để bắt đầu. Bạn hãy mở công cụ quản lý MySQL (như MySQL Workbench, phpMyAdmin, hoặc Terminal) và chạy lần lượt các lệnh sau:

1. **Tạo Database mới:**
   ```sql
   CREATE DATABASE computer_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE computer_pos;
   ```
2. **Import cấu trúc bảng và dữ liệu mẫu:** (Bạn có thể copy paste nội dung các file này vào chạy, hoặc dùng lệnh import)
   - Chạy file `database/schema.sql` (Tạo các bảng cơ sở)
   - Chạy file `database/migration_v2.sql` (Cập nhật bảng cho tính năng Nhập hàng, Đổi trả, Bảo hành)
   - Chạy file `database/migration_v3.sql` (Cập nhật tính năng Thông báo và Ca làm việc)
   - Chạy file `database/seed.sql` (Tạo sẵn 3 tài khoản Admin, Manager, Staff)

### Bước 3: Cài đặt và Chạy Backend (Máy chủ API)
Mở một cửa sổ Terminal mới, di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```

**Cấu hình môi trường (Backend):**
Copy file `.env.example` thành file `.env` (hoặc tạo file mới tên `.env` trong thư mục `backend`) với nội dung sau:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=computer_pos
JWT_SECRET=SoraPOS_SecretKey_2026_Secure
JWT_EXPIRES_IN=24h
GEMINI_API_KEY=Bỏ_Trống_Hoặc_Điền_Key_Của_Bạn_Vào_Đây
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```
*(Lưu ý: Đổi `DB_PASS` thành mật khẩu MySQL của máy bạn, nếu không có pass thì để trống)*

**Khởi động Backend:**
```bash
npm run dev
```
👉 *Backend sẽ chạy tại: `http://localhost:5000`*

### Bước 4: Cài đặt và Chạy Frontend (Giao diện web)
Mở một cửa sổ Terminal khác, di chuyển vào thư mục `frontend`:
```bash
cd frontend
npm install
```

**Cấu hình môi trường (Frontend):**
Tạo file `.env` trong thư mục `frontend` với nội dung sau:
```env
VITE_API_URL=http://127.0.0.1:5000/api
```

**Khởi động Frontend:**
```bash
npm run dev
```
👉 *Giao diện Web sẽ chạy tại: `http://localhost:3000`*

---

## 🔐 Tài khoản Đăng nhập Mặc định

Hệ thống đã được thiết lập sẵn 3 tài khoản trống với các phân quyền khác nhau. Bạn có thể sử dụng chúng để đăng nhập và bắt đầu nhập liệu:

| Username | Password   | Vai trò (Role) | Chức năng (Quyền hạn) |
|----------|------------|----------------|-----------------------|
| admin    | `12345678` | **Admin**      | Toàn quyền hệ thống, cài đặt, xóa user, báo cáo tổng, v.v. |
| manager  | `12345678` | **Manager**    | Quản lý sản phẩm, đơn hàng, nhập/trả hàng, nhân viên. |
| staff    | `12345678` | **Staff**      | Chỉ được phép tạo đơn bán hàng (POS) và xem tồn kho. |

---

## 🎯 Chức năng chính
1. **Màn hình POS Bán hàng:** Giao diện lưới thân thiện, hỗ trợ quét mã vạch (Barcode), tính tiền tự động, áp mã khuyến mãi.
2. **Quản lý Kho hàng:** Quản lý Tồn kho, Cảnh báo sắp hết hàng (Low stock), Phiếu nhập kho (Purchase Orders), Kiểm kho.
3. **Quản lý Hậu mãi:** Theo dõi Đổi/Trả hàng (Returns), quản lý phiếu Bảo hành (Warranties) theo Series/IMEI.
4. **AI Build PC:** Tự động đề xuất linh kiện lắp ráp máy tính (CPU, Mainboard, RAM, VGA...) đảm bảo độ tương thích (Socket, Công suất nguồn) thông qua tích hợp Google Gemini AI.
5. **Báo cáo Thống kê:** Báo cáo Doanh thu theo ngày/tháng, top sản phẩm bán chạy, doanh số theo nhân viên.

---

## ⚠️ Khắc phục sự cố thường gặp (Troubleshooting)
- **Lỗi 500 Internal Server Error khi đăng nhập:** Đảm bảo bạn đã chạy đầy đủ 3 file `schema.sql`, `migration_v2.sql`, và `migration_v3.sql` vào cơ sở dữ liệu.
- **Lỗi Network Error (Vite Http Proxy):** Đảm bảo `VITE_API_URL` trong file `.env` của frontend đang trỏ đúng về `http://127.0.0.1:5000/api` thay vì `localhost`.

---
*Chúc bạn có trải nghiệm tuyệt vời với hệ thống Computer POS System!*
