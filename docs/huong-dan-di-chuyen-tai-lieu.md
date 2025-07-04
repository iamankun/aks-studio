# Hướng dẫn Di chuyển Tài liệu

## Mục đích

Tài liệu này hướng dẫn quy trình di chuyển tất cả tài liệu hướng dẫn `.md` vào thư mục `docs/` để tuân thủ quy tắc tổ chức tệp mới.

## Các tài liệu cần di chuyển

Các tài liệu sau cần được di chuyển từ thư mục gốc vào thư mục `docs/`:

1. `ai-chat-debug.md` → `docs/ai-chat-debug.md`
2. `ai-chat-fix-guide.md` → `docs/ai-chat-fix-guide.md`
3. `AUTHORIZATION_TEST.md` → `docs/authorization-test.md`
4. `login-guide.md` → `docs/login-guide.md`
5. `MIGRATION_GUIDE.md` → `docs/migration-guide.md`
6. `debug-guide.md` → `docs/debug-guide.md`
7. `debug-tools-summary.md` → `docs/debug-tools-summary.md`
8. `api-debug-guide.md` → `docs/api-debug-guide.md`

## Các tài liệu cần giữ lại ở thư mục gốc

Chỉ giữ lại hai tài liệu chính ở thư mục gốc:

1. `README.md` - Giới thiệu dự án
2. `STATUS.md` - Trạng thái dự án

## Quy trình di chuyển

### 1. Kiểm tra tham chiếu

Trước khi di chuyển, cần kiểm tra tất cả các tham chiếu đến tài liệu:

```powershell
# Kiểm tra tham chiếu trong mã nguồn
Get-ChildItem -Recurse -Filter "*.tsx" | Select-String -Pattern "debug-guide|login-guide"

# Kiểm tra tham chiếu trong tài liệu khác
Get-ChildItem -Recurse -Filter "*.md" | Select-String -Pattern "\[.*\]\(.*\.md\)"
```

### 2. Di chuyển tài liệu

Sử dụng lệnh sau để di chuyển từng tài liệu:

```powershell
# Tạo thư mục docs nếu chưa có
if (-not (Test-Path -Path "docs")) {
    New-Item -ItemType Directory -Path "docs"
}

# Di chuyển tài liệu
Move-Item -Path "ai-chat-debug.md" -Destination "docs/ai-chat-debug.md"
Move-Item -Path "ai-chat-fix-guide.md" -Destination "docs/ai-chat-fix-guide.md"
# Tiếp tục với các tài liệu khác...
```

### 3. Cập nhật tham chiếu

Sau khi di chuyển, cần cập nhật tất cả tham chiếu đến tài liệu:

```powershell
# Ví dụ cập nhật tham chiếu trong file tsx
Get-ChildItem -Recurse -Filter "*.tsx" | ForEach-Object {
    (Get-Content $_.FullName) | 
    ForEach-Object { $_ -replace 'href="debug-guide.md"', 'href="docs/debug-guide.md"' } |
    Set-Content $_.FullName
}

# Cập nhật tham chiếu trong tài liệu markdown
Get-ChildItem -Recurse -Filter "*.md" | ForEach-Object {
    (Get-Content $_.FullName) | 
    ForEach-Object { $_ -replace '\(debug-guide\.md\)', '(docs/debug-guide.md)' } |
    Set-Content $_.FullName
}
```

### 4. Kiểm tra lại sau khi di chuyển

Sau khi di chuyển, kiểm tra lại để đảm bảo không có liên kết bị hỏng:

```powershell
# Kiểm tra liên kết đã cập nhật
Get-ChildItem -Recurse -Filter "*.md" | Select-String -Pattern "docs/.*\.md"
```

## Lịch trình thực hiện

- **Ngày bắt đầu**: 2025-07-05
- **Ngày hoàn thành**: 2025-07-06
- **Người thực hiện**: [Tên người phụ trách]

## Ghi chú bổ sung

- Tất cả tài liệu mới tạo sau này cần được đặt trực tiếp trong thư mục `docs/`
- Cần cập nhật README.md để thêm liên kết đến các tài liệu trong thư mục `docs/`
- Nên tạo một tệp `docs/README.md` để liệt kê tất cả tài liệu có trong thư mục
