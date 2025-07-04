# Scripts Reference

Thư mục này chứa các script tiện ích để kiểm tra, debug và quản lý dự án.

## Quy tắc viết script

Tất cả các script mới và cập nhật cần tuân thủ các quy tắc sau:

1. **Sử dụng ESM** - Tất cả script sử dụng cú pháp import/export
2. **Sử dụng dấu chấm phẩy (`;`) thay vì `&&`** - Mỗi lệnh trên một dòng riêng biệt
3. **Tái sử dụng utility** - Sử dụng các utility từ thư mục `utils/`
4. **Ghi log** - Ghi log vào thư mục logs/ qua `logToFile` function
5. **Cấu trúc chuẩn** - Bao gồm JSDoc mô tả và hướng dẫn chạy

## Cấu trúc mẫu script

```javascript
// @ts-check
/**
 * Mô tả ngắn gọn về chức năng của script
 * Chạy: node scripts/ten-script.js
 */
import { function1, function2 } from './utils/utility-file.js';
import { loadEnvVariables, logToFile } from './utils/env-loader.js';

// Load environment variables
loadEnvVariables();

// Main function
async function mainFunction() {
    try {
        // Code chính
        console.log('✅ Thành công!');
        
        // Ghi log
        await logToFile('Thông báo thành công', 'ten-file-log.log');
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        await logToFile(`Lỗi: ${error.message}`, 'ten-file-log.log');
    }
}

// Export functions - ES Module compatible
export { mainFunction };

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    mainFunction().catch(console.error);
}
```

## Các script chính

### Kiểm tra hệ thống

- `check-artists-table.js` - Kiểm tra cấu trúc và dữ liệu bảng artists
- `check-label-manager.js` - Kiểm tra tài khoản và quyền Label Manager
- `check-admin-auth.js` - Kiểm tra quyền admin và xác thực
- `check-route-handlers.mjs` - Kiểm tra API route handlers

### Kiểm tra database

- `check-submissions-table.js` - Kiểm tra cấu trúc bảng submissions
- `test-db.js` - Test kết nối database
- `check-table-columns.js` - Kiểm tra cấu trúc các bảng

### Kiểm tra API

- `test-submissions.js` - Test submissions API
- `test-real-authorization.js` - Test authorization với dữ liệu thực
- `debug-401-submissions.js` - Debug lỗi 401 với submissions API

### Tạo dữ liệu

- `create-linked-artist.mjs` - Tạo artist liên kết với label manager
- `add-test-submissions.mjs` - Thêm test submissions vào database

## Các thư mục con

- `utils/` - Các utility function dùng chung
- `tools/` - Các công cụ và script GUI

## Xem thêm

- `utils/README.md` - Hướng dẫn sử dụng utility functions
- `utils/CODING_RULES.md` - Quy tắc viết code chi tiết
