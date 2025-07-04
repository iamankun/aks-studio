# Công cụ quản trị nhật ký hoạt động

## Các công cụ quản trị

1. **Tạo bảng nhật ký**

   ```bash
   node scripts/tao-bang-nhat-ky.js
   ```

2. **Kiểm tra nhật ký**

   ```bash
   node scripts/kiem-tra-nhat-ky.js
   ```

3. **Xem và truy vấn nhật ký**

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

4. **Kiểm tra log đăng nhập**

   ```bash
   node scripts/kiem-tra-log-dang-nhap.js
   ```

5. **Quản lý nhật ký**

   ```bash
   # Xem trợ giúp
   node scripts/quan-ly-nhat-ky.js help

   # Xuất log ra CSV
   node scripts/quan-ly-nhat-ky.js export logs.csv

   # Xóa log cũ hơn 90 ngày
   node scripts/quan-ly-nhat-ky.js clean 90

   # Backup toàn bộ log
   node scripts/quan-ly-nhat-ky.js backup
   ```

6. **Phân tích phạm vi log**

   ```bash
   node scripts/phan-tich-pham-vi-log.js
   ```

Để có thêm thông tin chi tiết về cách sử dụng các công cụ, tham khảo file `scripts/README-NHAT-KY.md`.
