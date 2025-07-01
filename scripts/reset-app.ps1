# Reset Application State
# This script will:
# 1. Stop any running Next.js server
# 2. Clear browser data (localStorage) by opening fallback mode
# 3. Restart server in development mode

# Dừng các process Next.js đang chạy (tùy chọn - bạn có thể tắt thủ công)
# Get-Process -Name "node" | Where-Object {$_.CommandLine -like "*next*"} | Stop-Process -Force

# Thông báo cho người dùng
Write-Host "🧹 Đang khởi động lại ứng dụng trong chế độ fallback..." -ForegroundColor Yellow

# Mở trình duyệt trong chế độ fallback để làm sạch localStorage
Start-Process "http://localhost:3000/?mode=fallback"

# Khởi động lại server
Write-Host "🚀 Khởi động lại Next.js server..." -ForegroundColor Green
npm run dev
