# API Debug Guide

Hướng dẫn kiểm tra và debug các API trong dự án An Kun Studio Digital Music.

## 1. Công cụ debug API

Dự án cung cấp nhiều công cụ để kiểm tra và debug API. Dưới đây là danh sách các công cụ được cung cấp:

### 1.1. Script debug-api.mjs (Công cụ chính)

Script này giúp kiểm tra tất cả API endpoints trong dự án:

```powershell
# Kiểm tra tất cả endpoints
node debug-api.mjs

# Kiểm tra chỉ endpoints submissions
node debug-api.mjs submissions

# Kiểm tra chỉ endpoints auth
node debug-api.mjs auth
```

Script này sẽ gửi các HTTP requests đến các endpoints được cấu hình, bao gồm:

- Submissions API
- Auth API
- AI Chat API
- Users API

Kết quả sẽ được hiển thị trong terminal và lưu vào thư mục `logs/api-debug`.

### 1.2. Script api-routes-check.mjs

Kiểm tra tất cả API routes đã được cấu hình trong dự án:

```powershell
node api-routes-check.mjs
```

Script này sẽ quét tất cả file `route.ts` trong thư mục `app/api`, phân tích các HTTP methods được export và tạo báo cáo về tất cả API routes có sẵn.

### 1.3. Script test-api.ps1 (PowerShell)

Công cụ đơn giản để kiểm tra API submissions bằng PowerShell:

```powershell
.\test-api.ps1
```

### 1.4. Script scripts/simple-api-test.js

Test API đơn giản bằng axios:

```powershell
# Cài đặt axios (nếu chưa có)
npm install axios

# Chạy test
node scripts/simple-api-test.js
```

### 1.5. Script scripts/test-submissions-api.mjs

Test API submissions chi tiết:

```powershell
node scripts/test-submissions-api.mjs
```

### 1.6. Kiểm tra cấu trúc database

Phân tích và hiển thị cấu trúc database và services:

```powershell
node db-structure-check.mjs
```

Script này phân tích các file TypeScript liên quan đến database và tạo báo cáo về cấu trúc database, models, và services.

## 2. Kiểm tra API Submissions

API Submissions cung cấp các endpoints sau:

- `GET /api/submissions` - Lấy tất cả submissions
- `GET /api/submissions?username=...` - Lấy submissions của một user cụ thể
- `GET /api/submissions/[id]` - Lấy submission theo ID
- `GET /api/submissions/statistics` - Lấy thống kê về submissions
- `POST /api/submissions` - Tạo submission mới
- `PUT /api/submissions` - Cập nhật submission
- `DELETE /api/submissions?id=...` - Xóa submission
- `POST /api/submissions/resubmit` - Gửi lại submission
- `POST /api/submissions/approve-reject` - Phê duyệt/từ chối submission

### 2.1. Kiểm tra API với curl

```powershell
# GET /api/submissions
curl -u "test@example.com:password123" http://localhost:3000/api/submissions

# GET /api/submissions với username
curl -u "test@example.com:password123" "http://localhost:3000/api/submissions?username=test"

# GET /api/submissions/123
curl -u "test@example.com:password123" http://localhost:3000/api/submissions/123
```

### 2.2. Kiểm tra API với debug-api.mjs

```powershell
# Kiểm tra chỉ API submissions
node debug-api.mjs submissions
```

## 3. Phát hiện và giải quyết vấn đề thường gặp

### 3.1. Lỗi 404 Not Found

Nếu API `/api/submissions` trả về lỗi 404, hãy kiểm tra:

1. **Cấu trúc thư mục**: Đảm bảo có file `app/api/submissions/route.ts`
2. **Next.js Config**: Kiểm tra `next.config.js` có cài đặt đặc biệt nào không
3. **Server Status**: Đảm bảo Next.js dev server đang chạy
4. **Logs**: Kiểm tra console logs và error logs của Next.js

### 3.2. Lỗi 401 Unauthorized

- Kiểm tra thông tin đăng nhập trong script debug
- Xác nhận `auth-service.ts` và `authorization-service.ts` hoạt động đúng
- Kiểm tra session/token có đúng không

### 3.3. Lỗi 500 Internal Server Error

- Kiểm tra logs của Next.js
- Debug chi tiết logic trong `route.ts`
- Kiểm tra kết nối database và multi-database-service

## 4. Xử lý lỗi CORS

Nếu gặp lỗi CORS, hãy kiểm tra headers trong route.ts:

```typescript
// Ví dụ về CORS headers
response.headers.set('Access-Control-Allow-Origin', '*')
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
```

Đảm bảo method OPTIONS được định nghĩa trong `route.ts`.

## 5. Cấu trúc API Routes

Cấu trúc thư mục API:

```
app/
  api/
    submissions/
      route.ts               # GET, POST, PUT, DELETE submissions
      [id]/
        route.ts             # GET, PUT, DELETE submission by ID
      resubmit/
        route.ts             # POST resubmit submission
      approve-reject/
        route.ts             # POST approve/reject submission
      statistics/
        route.ts             # GET submission statistics
    auth/
      login/
        route.ts             # POST login
      logout/
        route.ts             # POST logout
      register/
        route.ts             # POST register
      check/
        route.ts             # GET check auth status
    ai-chat/
      route.ts               # POST ai chat
```

## 6. Logs và Báo cáo

Tất cả các script debug sẽ tạo logs trong các thư mục sau:

- `logs/api-debug/` - Logs từ debug-api.mjs
- `logs/api-test/` - Logs từ test API scripts
- `logs/api-routes-check.log` - Báo cáo về API routes
- `logs/db-structure.md` - Báo cáo về cấu trúc database

## 7. Cấu hình Script Debug

Tất cả các script debug có phần cấu hình ở đầu file, nơi bạn có thể:

- Thay đổi baseUrl (mặc định là `http://localhost:3000/api`)
- Cập nhật thông tin đăng nhập test
- Thêm/xóa/sửa các endpoints cần kiểm tra
- Tùy chỉnh thư mục log
