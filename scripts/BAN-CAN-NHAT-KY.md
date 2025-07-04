# Hệ Thống Nhật Ký Studio và Quản Lý Label

Các công cụ và tiện ích để quản lý, theo dõi và phân tích nhật ký hoạt động của hệ thống, cũng như quản lý Label trên hệ thống.

## Các Script Quản Trị Nhật Ký

- **tao-bang-nhat-ky.js**: Tạo bảng nhat_ky_studio trong cơ sở dữ liệu
- **kiem-tra-nhat-ky.js**: Kiểm tra chức năng ghi log vào nhat_ky_studio
- **xem-nhat-ky.js**: Truy vấn, tìm kiếm và xuất báo cáo từ bảng log
- **kiem-tra-log-dang-nhap.js**: Kiểm tra log đăng nhập/đăng ký
- **quan-ly-nhat-ky.js**: Quản lý log (xóa log cũ, backup log)
- **phan-tich-pham-vi-log.js**: Phân tích và đề xuất nơi cần thêm log hoạt động

## Cách Sử Dụng

### 1. Tạo bảng nhật ký

```bash
node scripts/tao-bang-nhat-ky.js
```

### 2. Kiểm tra nhật ký

```bash
node scripts/kiem-tra-nhat-ky.js
```

### 3. Xem và truy vấn nhật ký

```bash
# Xem trợ giúp
node scripts/xem-nhat-ky.js help

# Liệt kê logs (tối đa 50 bản ghi)
node scripts/xem-nhat-ky.js list 50

# Lọc theo tiêu chí
node scripts/xem-nhat-ky.js list --user=admin --action=login

# Xem thống kê
node scripts/xem-nhat-ky.js stats

# Xuất ra CSV
node scripts/xem-nhat-ky.js export logs.csv --limit=1000
```

### 4. Kiểm tra log đăng nhập

```bash
node scripts/kiem-tra-log-dang-nhap.js
```

### 5. Quản lý nhật ký

```bash
# Xem trợ giúp
node scripts/quan-ly-nhat-ky.js help

# Xuất log ra CSV
node scripts/quan-ly-nhat-ky.js export logs.csv

# Xóa log cũ hơn 90 ngày
node scripts/quan-ly-nhat-ky.js clean 90

# Backup toàn bộ log
node scripts/quan-ly-nhat-ky.js backup

# Xem thống kê log
node scripts/quan-ly-nhat-ky.js stats
```

### 6. Phân tích phạm vi log

```bash
node scripts/phan-tich-pham-vi-log.js
```

## Các Module Tiện Ích

- **lib/nhat-ky-studio.js**: Module phía server để ghi và truy vấn log
- **lib/client-activity-log.js**: Module phía client để ghi log từ giao diện người dùng
- **app/api/activity-log/route.js**: API endpoint để ghi log từ client

## Cấu Trúc Bảng Nhật Ký

```sql
CREATE TABLE nhat_ky_studio (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    username VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    component_name VARCHAR(255),
    session_id VARCHAR(255),
    related_ids JSONB
);
```

## Các Script Quản Lý Label

### 1. Kiểm tra quản lý label

```bash
node scripts/kiem-tra-quan-ly-label.js
```

Công cụ này sẽ:

- Kiểm tra thông tin Label Manager trong database
- Xác nhận quyền và vai trò của Label Manager
- Hiển thị chi tiết các thuộc tính của Label Manager
- Kiểm tra hoạt động gần đây từ nhật ký

### 2. Kiểm tra cấu trúc bảng label

```bash
node scripts/kiem-tra-cau-truc-bang-label.js
```

Công cụ này sẽ:

- Kiểm tra các bảng liên quan đến Label Manager
- Phân tích cấu trúc các bảng dữ liệu
- Kiểm tra khóa ngoại và mối quan hệ
- Phân tích dữ liệu trong bảng label_manager

### 3. Quản lý label

```bash
# Xem trợ giúp
node scripts/quan-ly-label.js

# Liệt kê tất cả label
node scripts/quan-ly-label.js list

# Kiểm tra một label cụ thể
node scripts/quan-ly-label.js check 1

# Tạo báo cáo gán nhãn
node scripts/quan-ly-label.js report

# Tạo báo cáo gán nhãn và xuất ra file
node scripts/quan-ly-label.js report -o labels-report.json

# Cập nhật thông tin label
node scripts/quan-ly-label.js update 1 -n "Tên mới" -d "Mô tả mới" -s active

# Gán label cho người dùng
node scripts/quan-ly-label.js assign 123 1
```

## Cấu Trúc Bảng Label

```sql
CREATE TABLE label_manager (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE label_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE label_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    label_id INTEGER NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255),
    FOREIGN KEY (label_id) REFERENCES label_templates(id)
);
```
