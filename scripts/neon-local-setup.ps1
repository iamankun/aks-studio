# Neon Local Setup & Run
# Use this script to start Neon Local in Docker

# Yêu cầu: Docker phải được cài đặt và đang chạy

# Kiểm tra xem Docker đã được cài đặt chưa
if (!(Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker không được tìm thấy. Vui lòng cài đặt Docker trước khi chạy script này." -ForegroundColor Red
    exit 1
}

# Tạo thư mục cho dữ liệu Neon nếu nó chưa tồn tại
$neonDataDir = ".\neon-local-data"
if (!(Test-Path $neonDataDir)) {
    Write-Host "📁 Tạo thư mục cho dữ liệu Neon Local..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $neonDataDir | Out-Null
}

# Kéo image Docker Neon Local nếu chưa có
Write-Host "🔄 Kiểm tra và kéo image Docker cho Neon Local..." -ForegroundColor Cyan
docker pull neondatabase/neon-local

# Thiết lập biến môi trường
Write-Host "🔧 Thiết lập biến môi trường để sử dụng Neon Local..." -ForegroundColor Cyan
$env:USE_NEON_LOCAL = "true"

# Chạy container Neon Local
Write-Host "🚀 Khởi động Neon Local trong Docker..." -ForegroundColor Green
docker run --name neon-local `
    -e POSTGRES_PASSWORD=postgres `
    -p 5432:5432 `
    -v "${PWD}\${neonDataDir}:/var/lib/postgresql/data" `
    --rm `
    neondatabase/neon-local
