# Hướng Dẫn Sử Dụng Công Cụ Quản Lý Label

Tài liệu này hướng dẫn cách sử dụng các công cụ quản lý Label trong hệ thống DMG (Digital Music Gateway).

## I. Tổng Quan

Hệ thống quản lý Label giúp:

- Tạo và quản lý các label (nhãn) cho nội dung âm nhạc
- Gán nhãn cho người dùng và bài hát
- Phân tích và theo dõi việc sử dụng nhãn
- Tạo báo cáo về gán nhãn

## II. Cài Đặt và Yêu Cầu

1. Node.js (v14 trở lên)
2. Các package cần thiết:

   ```bash
   npm install dotenv pg chalk commander fs-extra
   ```

3. Cấu hình kết nối database trong file `.env.local`:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

## III. Các Công Cụ Quản Lý Label

### 1. Kiểm Tra Quản Lý Label (`kiem-tra-quan-ly-label.js`)

Công cụ này giúp kiểm tra thông tin và quyền của Label Manager trong hệ thống.

#### Cách sử dụng

```bash
node scripts/kiem-tra-quan-ly-label.js
```

#### Mô tả chi tiết

- **Kết nối database**: Kết nối đến database và xác thực
- **Kiểm tra Label Manager**: Tìm kiếm thông tin Label Manager từ bảng `label_manager`
- **Phân tích quyền**: Kiểm tra và hiển thị thông tin quyền từ trường `permissions`
- **Kiểm tra hoạt động**: Hiển thị hoạt động gần đây từ nhật ký (`nhat_ky_studio`)

### 2. Kiểm Tra Cấu Trúc Bảng Label (`kiem-tra-cau-truc-bang-label.js`)

Công cụ này giúp kiểm tra cấu trúc các bảng liên quan đến hệ thống Label Manager.

#### Cách sử dụng

```bash
node scripts/kiem-tra-cau-truc-bang-label.js
```

#### Mô tả chi tiết

- **Kiểm tra tồn tại bảng**: Xác nhận các bảng cần thiết đã được tạo
- **Phân tích cấu trúc**: Hiển thị chi tiết cấu trúc các cột trong mỗi bảng
- **Kiểm tra khóa ngoại**: Xác định mối quan hệ giữa các bảng
- **Phân tích dữ liệu**: Thống kê và hiển thị mẫu dữ liệu từ bảng `label_manager`

### 3. Quản Lý Label (`quan-ly-label.js`)

Công cụ toàn diện giúp quản lý labels trong hệ thống.

#### Cách sử dụng cơ bản

```bash
node scripts/quan-ly-label.js [lệnh]
```

#### Các lệnh có sẵn

1. **Liệt kê labels**:

   ```bash
   node scripts/quan-ly-label.js list
   ```

2. **Kiểm tra một label cụ thể**:

   ```bash
   node scripts/quan-ly-label.js check <labelId>
   ```

3. **Tạo báo cáo gán nhãn**:

   ```bash
   node scripts/quan-ly-label.js report
   ```

   Xuất báo cáo ra file:

   ```bash
   node scripts/quan-ly-label.js report -o path/to/report.json
   ```

4. **Cập nhật thông tin label**:

   ```bash
   node scripts/quan-ly-label.js update <labelId> [options]
   ```

   Các tùy chọn:
   - `-n, --name <name>`: Tên mới cho label
   - `-d, --description <description>`: Mô tả mới
   - `-s, --status <status>`: Trạng thái mới (active/inactive)

   Ví dụ:

   ```bash
   node scripts/quan-ly-label.js update 1 -n "Pop Music" -d "Popular music genre" -s active
   ```

5. **Gán nhãn cho người dùng**:

   ```bash
   node scripts/quan-ly-label.js assign <userId> <labelId>
   ```

   Ví dụ:

   ```bash
   node scripts/quan-ly-label.js assign 123 1
   ```

## IV. Quy Trình Làm Việc

### Quy trình tạo và quản lý label mới

1. Kiểm tra cấu trúc database:

   ```bash
   node scripts/kiem-tra-cau-truc-bang-label.js
   ```

2. Tạo label mới trong database (thông qua SQL hoặc giao diện quản trị)

3. Liệt kê và xác nhận label đã được tạo:

   ```bash
   node scripts/quan-ly-label.js list
   ```

4. Cập nhật thông tin nếu cần:

   ```bash
   node scripts/quan-ly-label.js update <labelId> -n "Tên mới" -d "Mô tả mới"
   ```

5. Gán label cho người dùng:

   ```bash
   node scripts/quan-ly-label.js assign <userId> <labelId>
   ```

6. Tạo báo cáo gán nhãn:

   ```bash
   node scripts/quan-ly-label.js report -o labels-report.json
   ```

### Quy trình kiểm tra và xử lý sự cố

1. Kiểm tra quyền và thông tin Label Manager:

   ```bash
   node scripts/kiem-tra-quan-ly-label.js
   ```

2. Xác minh label cụ thể:

   ```bash
   node scripts/quan-ly-label.js check <labelId>
   ```

3. Kiểm tra nhật ký liên quan:

   ```bash
   node scripts/xem-nhat-ky.js list --action=assign_label
   ```

## V. Các Tình Huống Thực Tế

### Tình huống 1: Kiểm tra và cập nhật label không hoạt động

```bash
# Liệt kê tất cả labels để tìm các label inactive
node scripts/quan-ly-label.js list

# Kiểm tra chi tiết label không hoạt động
node scripts/quan-ly-label.js check 5

# Cập nhật trạng thái thành active
node scripts/quan-ly-label.js update 5 -s active
```

### Tình huống 2: Tạo báo cáo gán nhãn cuối tháng

```bash
# Tạo báo cáo tổng quan
node scripts/quan-ly-label.js report -o reports/labels-report-feb2024.json

# Kiểm tra nhật ký hoạt động gán nhãn trong tháng
node scripts/xem-nhat-ky.js list --action=assign_label --date=2024-02
```

### Tình huống 3: Xử lý khi Label Manager không có quyền đầy đủ

```bash
# Kiểm tra thông tin và quyền Label Manager
node scripts/kiem-tra-quan-ly-label.js

# Thực hiện cập nhật quyền trong database (SQL)
# UPDATE label_manager SET permissions = '{"role":"admin","allowDelete":true,"allowApprove":true}' WHERE username = 'admin';

# Kiểm tra lại quyền sau khi cập nhật
node scripts/kiem-tra-quan-ly-label.js
```

## VI. Lưu Ý và Thực Hành Tốt Nhất

1. **Sao lưu dữ liệu**: Luôn sao lưu database trước khi thực hiện các thao tác quan trọng

2. **Kiểm tra quyền**: Đảm bảo tài khoản đăng nhập có đủ quyền truy cập và sửa đổi database

3. **Ghi nhật ký**: Các thao tác quan trọng nên được ghi lại trong nhật ký hoạt động

4. **Tránh xóa dữ liệu**: Nên đánh dấu không hoạt động thay vì xóa các label đã được sử dụng

5. **Kiểm tra định kỳ**: Thực hiện kiểm tra cấu trúc database và quyền định kỳ

---

**Người phụ trách**: An Kun Studio Development Team  
**Cập nhật lần cuối**: 15/02/2024
