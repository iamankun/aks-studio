# Thông tin debug AI Chat Assistant

## Vấn đề đã sửa

1. **Chuyển đổi mã trạng thái lỗi**: Tất cả lỗi từ AI API bây giờ sẽ trả về status code 200 với thông tin lỗi trong nội dung JSON, giúp client xử lý lỗi dễ dàng hơn.

2. **Thêm thông tin debug**: Thêm log chi tiết của request để dễ dàng debug.

3. **Sửa lỗi tham số model**: Sử dụng biến môi trường AI_MODEL để đảm bảo gửi đúng mô hình.

4. **Sửa lỗi xử lý trùng lặp**: Xóa đoạn mã trùng lặp kiểm tra lỗi 5xx.

## Cấu hình API hiện tại

```env
AI_ENDPOINT="https://api.deepseek.com/v1/chat/completions"
API_KEY="sk-cf151329498643bf8a37f2c675e7c24a"
AI_MODEL="deepseek-chat"
```

## Cách kiểm tra lỗi

1. Kiểm tra log server để xem request gửi đến API
2. Kiểm tra phản hồi từ API để xác định vấn đề cụ thể
3. Nếu API trả về 400, có thể do:
   - Không có tham số model
   - Cấu trúc messages không đúng
   - API key không đúng định dạng

## Tài liệu tham khảo

- [Deepseek API documentation](https://platform.deepseek.com/api-reference)
- [Deepseek Chat Models](https://platform.deepseek.com/models)
