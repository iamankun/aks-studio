# Tóm tắt Công cụ Debug - An Kun Studio Digital Music

Tổng hợp đầy đủ các công cụ debug cho dự án, giúp kiểm tra và giải quyết vấn đề trong API, Authentication, Database, UI/UX và toàn bộ hệ thống.

## Quick Debug Commands

Chạy nhanh các lệnh debug bằng npm:

```bash
# Test API endpoints, đặc biệt là /api/submissions
npm run debug:api

# Test kết nối trực tiếp và truy vấn database
npm run debug:db

# Test luồng xác thực cơ bản
npm run debug:auth

# Test xác thực với dữ liệu thực
npm run debug:real-auth

# Test quản lý người dùng và xác thực
npm run debug:users

# Test hệ thống submissions
npm run debug:submissions

# Test chức năng gửi email
npm run debug:email

# Kiểm tra toàn diện hệ thống
npm run verify-system
```

## Danh sách Công cụ Debug Chi Tiết

### 1. Công cụ Debug API

| Công cụ | Mô tả | Cách sử dụng |
|---------|-------|--------------|
| `scripts/debug-api.mjs` | Công cụ chính để test tất cả API endpoints | `npm run debug:api` hoặc `node scripts/debug-api.mjs [endpoint]` |
| `api-routes-check.mjs` | Quét và hiển thị tất cả API routes | `node api-routes-check.mjs` |
| `test-api.ps1` | Test API bằng PowerShell | `.\test-api.ps1` |
| `scripts/simple-api-test.js` | Test API đơn giản với axios | `npm run debug:api` hoặc `node scripts/simple-api-test.js` |
| `scripts/test-submissions-api.mjs` | Test API submissions chi tiết | `npm run debug:submissions` hoặc `node scripts/test-submissions-api.mjs` |
| `scripts/check-route-handlers.mjs` | Kiểm tra handlers trong các file route.ts | `node scripts/check-route-handlers.mjs` |

### 2. Công cụ Debug Database & Auth

| Công cụ | Mô tả | Cách sử dụng |
|---------|-------|--------------|
| `scripts/test-direct-db.mjs` | Test kết nối và truy vấn Neon PostgreSQL | `npm run debug:db` |
| `scripts/test-authorization.js` | Test xác thực cơ bản | `npm run debug:auth` |
| `scripts/test-real-authorization.js` | Test xác thực với dữ liệu thực | `npm run debug:real-auth` |
| `scripts/test-real-users.js` | Test quản lý người dùng | `npm run debug:users` |
| `scripts/test-email.js` | Test chức năng email | `npm run debug:email` |
| `scripts/db-structure-check.mjs` | Phân tích cấu trúc database và services | `node scripts/db-structure-check.mjs` |

### 3. Công cụ Cài đặt và Hướng dẫn

| Công cụ | Mô tả |
|---------|-------|
| `scripts/install-debug-tools.js` | Cài đặt dependencies và cấu hình scripts debug |
| `debug-guide.md` | Hướng dẫn debug toàn diện |
| `api-debug-guide.md` | Hướng dẫn debug API chi tiết |

## Chi Tiết Các Lệnh Debug

### debug:api

- Tests tất cả API endpoints under /api/submissions
- Kiểm tra status code của responses
- Xác minh cấu trúc dữ liệu response
- Bao gồm test các trường hợp lỗi

### debug:db

- Tests kết nối trực tiếp đến Neon PostgreSQL
- Xác minh schema database
- Kiểm tra cấu trúc và mối quan hệ giữa các bảng
- Tests các thao tác CRUD cơ bản

### debug:auth

- Tests luồng xác thực cơ bản
- Xác minh việc tạo/xác thực JWT token
- Tests kiểm tra quyền
- Tests kiểm soát truy cập dựa trên role

### debug:real-auth

- Tests xác thực với dữ liệu người dùng thực
- Xác minh luồng auth trong môi trường production
- Tests các edge case với tài khoản thực

### debug:users

- Tests chức năng quản lý người dùng
- Xác minh tạo/cập nhật/xóa user
- Tests roles và quyền của user
- Xác minh tính toàn vẹn dữ liệu user

### debug:submissions

- Tests hệ thống submissions từ đầu đến cuối
- Xác minh quy trình submissions
- Tests quy trình phê duyệt/từ chối
- Xác minh dữ liệu submissions

### debug:email

- Tests chức năng gửi email
- Xác minh các template email
- Tests hệ thống email queue
- Xác minh nội dung và định dạng email

### verify-system

- Kiểm tra toàn diện hệ thống
- Tests tất cả thành phần quan trọng
- Xác minh tích hợp hệ thống
- Báo cáo tình trạng sức khỏe hệ thống

## Best Practices

1. Luôn chạy `debug:db` đầu tiên để đảm bảo kết nối database
2. Chạy `debug:auth` trước khi test các tính năng liên quan đến user
3. Sử dụng `debug:api` để kiểm tra API endpoints sau khi thay đổi code
4. Chạy `verify-system` trước khi deploy lên production

## Xử lý Sự cố

Nếu bất kỳ lệnh debug nào thất bại:

1. Kiểm tra file `.env.local` để xem các biến môi trường đã chính xác chưa
2. Đảm bảo database có thể truy cập được
3. Kiểm tra kết nối mạng
4. Xem lại error logs trong thư mục `logs`
5. Đảm bảo đã cài đặt đầy đủ các dependencies

## Lưu ý

- Tất cả các công cụ tạo logs trong thư mục `logs/`
- Mỗi công cụ có phần cấu hình ở đầu file, có thể tùy chỉnh
- Đọc file `debug-guide.md` và `api-debug-guide.md` để biết thêm chi tiết
- Scripts đã được thêm vào `package.json` để dễ dàng sử dụng
