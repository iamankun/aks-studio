# Hướng dẫn Debug toàn diện cho dự án An Kun Studio Digital Music

Tài liệu này cung cấp hướng dẫn chi tiết về các công cụ debug có sẵn trong dự án, giúp bạn phát hiện và giải quyết vấn đề nhanh chóng.

## 1. Công cụ debug API

Dự án cung cấp nhiều công cụ để kiểm tra và debug API:

| Công cụ | Mô tả | Cách sử dụng |
|---------|-------|--------------|
| `debug-api.mjs` | Công cụ chính để test tất cả API endpoints | `node debug-api.mjs [endpoint]` |
| `api-routes-check.mjs` | Quét và hiển thị tất cả API routes | `node api-routes-check.mjs` |
| `test-api.ps1` | Test API bằng PowerShell | `.\test-api.ps1` |
| `scripts/simple-api-test.js` | Test API đơn giản với axios | `node scripts/simple-api-test.js` |
| `check-route-handlers.mjs` | Kiểm tra handlers trong các file route.ts | `node check-route-handlers.mjs` |

Xem chi tiết tại: [API Debug Guide](./api-debug-guide.md)

## 2. Công cụ debug Database

| Công cụ | Mô tả | Cách sử dụng |
|---------|-------|--------------|
| `db-structure-check.mjs` | Phân tích cấu trúc database và services | `node db-structure-check.mjs` |
| `check-db-tables.js` | Kiểm tra cấu trúc bảng database | `node check-db-tables.js` |
| `check-table-columns.js` | Kiểm tra các cột trong database | `node check-table-columns.js` |

## 3. Công cụ debug Authentication

| Công cụ | Mô tả | Cách sử dụng |
|---------|-------|--------------|
| `check-artists-auth.js` | Kiểm tra quyền của artists | `node check-artists-auth.js` |
| `test-authorization.js` | Test hệ thống authorization | `node test-authorization.js` |
| `scripts/test-real-authorization.js` | Test authorization với dữ liệu thực | `node scripts/test-real-authorization.js` |
| `test-real-users.js` | Test user authentication với dữ liệu thực | `node test-real-users.js` |

Xem chi tiết tại: [Authentication Test Guide](./AUTHORIZATION_TEST.md)

## 4. Hướng dẫn debug UI/UX

### 4.1. Loading Screen

Để debug Loading Screen, bạn có thể:

1. Kiểm tra file `components/loading-screen.tsx`
2. Truy cập route test: `/test/loading`
3. Kiểm tra console logs khi loading

### 4.2. Background System

Để debug Background System:

1. Kiểm tra file `components/background-system.tsx`
2. Kiểm tra file `components/background-settings-panel.tsx`
3. Truy cập route test: `/test/background`

### 4.3. AI Chat Assistant

Để debug AI Chat Assistant:

1. Kiểm tra file `components/ai-chat-assistant.tsx`
2. Kiểm tra file `app/api/ai-chat/route.ts`
3. Truy cập route: `/chat` hoặc bất kỳ route nào có chat assistant

## 5. Hướng dẫn debug Authentication và Authorization

### 5.1. Quy trình đăng nhập

Quy trình đăng nhập được xử lý bởi:

1. `components/auth/login-view.tsx` - UI
2. `app/api/auth/login/route.ts` - API endpoint
3. `lib/auth-service.ts` - Logic authentication

Để debug:

- Kiểm tra logs console khi đăng nhập
- Kiểm tra network requests trong DevTools
- Sử dụng `test-real-users.js` để test login với dữ liệu thực

### 5.2. Quy trình đăng ký

Quy trình đăng ký được xử lý bởi:

1. `components/auth/register-view.tsx` - UI
2. `app/api/auth/register/route.ts` - API endpoint

Để debug:

- Kiểm tra logs console khi đăng ký
- Kiểm tra network requests trong DevTools

### 5.3. Authorization

Authorization được xử lý bởi:

1. `lib/authorization-service.ts` - Logic chính
2. `hooks/use-authorization.ts` - React hook
3. `components/authorized-component.tsx` - UI component

Để debug:

- Sử dụng `test-authorization.js` để test quyền
- Kiểm tra user role trong console

## 6. Hướng dẫn debug API Submissions

### 6.1. Cấu trúc API Submissions

API Submissions có cấu trúc sau:

- `GET /api/submissions` - Lấy tất cả submissions
- `GET /api/submissions?username=...` - Lấy submissions của một user
- `GET /api/submissions/[id]` - Lấy submission theo ID
- `POST /api/submissions` - Tạo submission mới
- `PUT /api/submissions` - Cập nhật submission
- `DELETE /api/submissions?id=...` - Xóa submission

### 6.2. Debug với các công cụ

1. Kiểm tra route files:

   ```
   node api-routes-check.mjs
   ```

2. Test API submissions:

   ```
   node debug-api.mjs submissions
   ```

3. Kiểm tra handlers trong route files:

   ```
   node check-route-handlers.mjs
   ```

## 7. Logs và Reports

Tất cả công cụ debug tạo logs và reports trong các thư mục sau:

- `logs/api-debug/` - Logs từ debug API
- `logs/api-test/` - Logs từ test API
- `logs/db/` - Logs và reports database
- `logs/auth/` - Logs và reports authentication

## 8. Giải quyết vấn đề thường gặp

### 8.1. Lỗi 404 Not Found

Nếu API trả về lỗi 404:

1. Kiểm tra cấu trúc thư mục `app/api/`
2. Đảm bảo file `route.ts` đúng vị trí
3. Kiểm tra file `next.config.js`
4. Khởi động lại Next.js dev server

### 8.2. Lỗi Authentication

Nếu gặp lỗi authentication:

1. Kiểm tra file `lib/auth-service.ts`
2. Kiểm tra session/token
3. Sử dụng `test-real-users.js`

### 8.3. Lỗi UI/UX

Nếu UI/UX không hoạt động đúng:

1. Kiểm tra console logs
2. Kiểm tra components bị ảnh hưởng
3. Sử dụng routes test: `/test/*`

## 9. Tài liệu tham khảo

- [API Debug Guide](./api-debug-guide.md)
- [Authorization Test Guide](./AUTHORIZATION_TEST.md)
- [Login Guide](./login-guide.md)
- [Migration Guide](./MIGRATION_GUIDE.md)

## 10. Tools

Danh sách đầy đủ các công cụ debug trong dự án:

- `debug-api.mjs` - Debug API endpoints
- `api-routes-check.mjs` - Kiểm tra API routes
- `test-api.ps1` - Test API với PowerShell
- `scripts/simple-api-test.js` - Test API đơn giản
- `check-route-handlers.mjs` - Kiểm tra handlers
- `db-structure-check.mjs` - Phân tích cấu trúc database
- `check-db-tables.js` - Kiểm tra bảng database
- `check-table-columns.js` - Kiểm tra cột database
- `check-artists-auth.js` - Kiểm tra quyền artists
- `test-authorization.js` - Test authorization
- `scripts/test-real-authorization.js` - Test authorization thực
- `test-real-users.js` - Test users thực
- `test-submissions.js` - Test submissions
- `check-submissions-schema.js` - Kiểm tra schema submissions
- `check-artist-schema.js` - Kiểm tra schema artists
