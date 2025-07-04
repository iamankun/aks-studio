# Hướng dẫn đăng nhập và xử lý lỗi

## Đăng nhập hệ thống

Bạn có thể đăng nhập bằng tài khoản đã được tạo trong cơ sở dữ liệu. Hệ thống sử dụng database Neon PostgreSQL làm cơ sở dữ liệu chính.

## Vấn đề AI Chat

Đã cập nhật endpoint AI Chat để sử dụng thông tin cấu hình đúng.

## Xử lý lỗi 401

- Đã thêm xử lý riêng cho lỗi 401 (Authentication Failed) trong API endpoint
- Đã cải thiện thông báo lỗi với chi tiết cụ thể hơn
- Đã thêm logging chi tiết hơn bao gồm mã trạng thái
- Đã cập nhật component chat để hiển thị thông báo lỗi phù hợp

## Biến môi trường

Đảm bảo biến môi trường được tải đúng cách khi khởi động ứng dụng. Nếu cần, bạn có thể sử dụng file `.env.local` để cấu hình.

## Khởi động lại ứng dụng

Sau khi thay đổi, bạn cần khởi động lại ứng dụng để các thay đổi có hiệu lực:

```bash
npm run dev
```
