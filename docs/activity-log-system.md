# Hệ thống ghi log hoạt động (Nhật ký Studio)

Hệ thống ghi log hoạt động cho ứng dụng An Kun Studio Digital Music, sử dụng bảng `nhat_ky_studio` để theo dõi các hoạt động của người dùng.

## Các file trong hệ thống

1. **scripts/tao-bang-nhat-ky.js** - Script tạo bảng nhat_ky_studio trong database
2. **lib/nhat-ky-studio.js** - Module tiện ích ghi log, lấy log, truy vấn log
3. **lib/client-activity-log.js** - Tiện ích client-side để ghi log hoạt động từ phía client
4. **app/api/activity-log/route.js** - API endpoint cho phép ghi và truy vấn log
5. **scripts/kiem-tra-nhat-ky.js** - Script kiểm tra chức năng ghi log
6. **scripts/xem-nhat-ky.js** - Script quản lý và xem log
7. **scripts/kiem-tra-log-dang-nhap.js** - Script kiểm tra log đăng nhập/đăng ký
8. **scripts/quan-ly-nhat-ky.js** - Script quản lý log (backup, xóa log cũ)
9. **scripts/phan-tich-pham-vi-log.js** - Script phân tích và đề xuất nơi cần thêm log

## Cấu trúc bảng nhat_ky_studio

```sql
CREATE TABLE nhat_ky_studio (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    status VARCHAR(50),
    result VARCHAR(100),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nhat_ky_studio_action ON nhat_ky_studio(action);
CREATE INDEX idx_nhat_ky_studio_username ON nhat_ky_studio(username);
CREATE INDEX idx_nhat_ky_studio_created_at ON nhat_ky_studio(created_at);
CREATE INDEX idx_nhat_ky_studio_entity_type ON nhat_ky_studio(entity_type);
```

## Sử dụng hệ thống ghi log

### 1. Ghi log từ server-side

```javascript
import { addActivityLog } from '@/lib/nhat-ky-studio';

// Ghi log đơn giản
await addActivityLog({
    username: 'admin',
    action: 'approve_submission',
    description: 'Duyệt bài hát',
    entityType: 'submission',
    entityId: '12345',
    status: 'success'
});
```

### 2. Ghi log từ client-side

```javascript
import { logActivity, logLogin, logUIInteraction } from '@/lib/client-activity-log';

// Ghi log đăng nhập
logLogin('password', 'success', {
    username: 'ankun',
    method: 'password'
});

// Ghi log tương tác UI
logUIInteraction('button', 'submit-form', {
    formName: 'upload-form',
    section: 'metadata'
});
```

### 3. Xem và quản lý log

```bash
# Xem thống kê log
node view-nhat-ky-studio.js stats

# Xuất log ra file CSV
node view-nhat-ky-studio.js export activity-logs.csv

# Xóa log cũ hơn 30 ngày
node view-nhat-ky-studio.js clean 30

# Kiểm tra log đăng nhập/đăng ký
node check-login-logs.js

# Backup toàn bộ log
node manage-activity-logs.js backup
```

## Các loại log được ghi lại

1. **Đăng nhập/Đăng ký**
   - Đăng nhập thành công/thất bại
   - Đăng ký thành công/thất bại
   - Đăng xuất

2. **Tương tác UI**
   - Click nút
   - Submit form
   - Chuyển tab/trang
   - Tương tác với các phần tử giao diện

3. **Submissions**
   - Tạo submission mới
   - Cập nhật submission
   - Xóa submission
   - Duyệt/từ chối submission

4. **Xem trang**
   - Ghi lại các lượt xem trang

5. **Lỗi**
   - Lỗi client-side
   - Lỗi API
   - Lỗi xác thực

## Tích hợp

Hệ thống log đã được tích hợp vào các components:

1. **Login View** - components/auth/login-view.tsx
2. **Register View** - components/auth/register-view.tsx
3. **Upload Form View** - components/views/upload-form-view.tsx

## Thêm tích hợp mới

Để tích hợp log vào components khác:

1. Import các hàm log cần thiết:

   ```javascript
   import { logUIInteraction, logPageView } from '@/lib/client-activity-log';
   ```

2. Gọi hàm log tại các điểm cần ghi log:

   ```javascript
   // Trong onClick handler
   const handleButtonClick = () => {
     logUIInteraction('button', 'download-report', {
       reportId: reportId,
       section: 'dashboard'
     });
     // Xử lý logic
   };

   // Trong useEffect để ghi log pageView
   useEffect(() => {
     logPageView('dashboard', {
       referrer: document.referrer
     });
   }, []);
   ```

## Lưu ý bảo mật

- Không ghi log thông tin nhạy cảm (mật khẩu, token)
- Tuân thủ quy định bảo vệ dữ liệu người dùng
- Xóa log cũ định kỳ để giảm dung lượng database
