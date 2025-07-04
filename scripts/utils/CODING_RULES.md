# Quy Tắc Viết Script

Tài liệu này mô tả các quy tắc để viết script chuẩn trong dự án.

## Quy tắc sử dụng dấu chấm phẩy thay vì `&&`

### Quy tắc mới

Không sử dụng toán tử `&&` để nối các lệnh, thay vào đó sử dụng dấu chấm phẩy `;` và đặt mỗi lệnh trên một dòng riêng biệt.

### Ví dụ

#### ❌ Không sử dụng cách này

```javascript
// Không tốt: Sử dụng && để nối lệnh
checkDatabase() && processData() && saveResults();

// Không tốt: Nhiều lệnh trên một dòng
connect(); query(); disconnect();
```

#### ✅ Sử dụng cách này

```javascript
// Tốt: Mỗi lệnh trên một dòng riêng
checkDatabase();
processData();
saveResults();

// Hoặc sử dụng async/await
await checkDatabase();
await processData();
await saveResults();
```

### Lý do

1. **Dễ đọc hơn**: Mỗi lệnh trên một dòng giúp code dễ đọc hơn
2. **Dễ debug hơn**: Khi có lỗi, dễ dàng xác định lệnh nào gây ra lỗi
3. **Tránh lỗi ngắt dòng**: Toán tử `&&` có thể gây ra lỗi khi code bị ngắt dòng không đúng
4. **Xử lý lỗi tốt hơn**: Có thể bắt lỗi riêng cho từng lệnh với try/catch

### Trong terminal

Khi chạy lệnh trong terminal, vẫn có thể sử dụng `;` để nối lệnh:

```powershell
# PowerShell
cd scripts; node check-artists-table.js; echo "Done!"
```

```bash
# Bash
cd scripts; node check-artists-table.js; echo "Done!"
```

## Áp dụng

Khi viết script mới hoặc sửa script cũ, hãy tuân thủ quy tắc này. Các script cũ sẽ được cập nhật dần dần theo quy tắc mới.
