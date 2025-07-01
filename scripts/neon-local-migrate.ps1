# Neon Local Database Setup
# This script will run database migrations on your local Neon instance

# Kiểm tra xem Docker đã chạy Neon Local chưa
$neonContainer = docker ps -q --filter "name=neon-local"
if (!$neonContainer) {
    Write-Host "❌ Neon Local không chạy. Vui lòng chạy scripts/neon-local-setup.ps1 trước." -ForegroundColor Red
    exit 1
}

# Cài đặt psql nếu chưa có
$hasPsql = $null
try {
    $hasPsql = Get-Command "psql" -ErrorAction SilentlyContinue
} catch {
    $hasPsql = $null
}

if (!$hasPsql) {
    Write-Host "⚠️ psql không được tìm thấy. Sử dụng docker exec để chạy migrations..." -ForegroundColor Yellow
    
    # Tạo database dmg nếu chưa tồn tại
    Write-Host "🗄️ Tạo database dmg..." -ForegroundColor Cyan
    docker exec neon-local psql -U postgres -c "CREATE DATABASE dmg WITH OWNER = postgres ENCODING = 'UTF8' CONNECTION LIMIT = -1;"
    
    # Copy các file SQL vào container
    Write-Host "📋 Copy file SQL vào container..." -ForegroundColor Cyan
    docker cp .\scripts\step2_create_tables.sql neon-local:/tmp/
    docker cp .\scripts\alter_tables_for_binary.sql neon-local:/tmp/
    
    # Chạy scripts trong container
    Write-Host "🚀 Chạy các scripts migration..." -ForegroundColor Green
    docker exec neon-local psql -U postgres -d dmg -f /tmp/step2_create_tables.sql
    docker exec neon-local psql -U postgres -d dmg -f /tmp/alter_tables_for_binary.sql
    
    Write-Host "✅ Migrations hoàn tất!" -ForegroundColor Green
} else {
    # Nếu có psql, sử dụng nó trực tiếp
    Write-Host "🗄️ Sử dụng psql local để chạy migrations..." -ForegroundColor Cyan
    
    # Tạo database dmg nếu chưa tồn tại
    psql -h localhost -U postgres -c "CREATE DATABASE dmg WITH OWNER = postgres ENCODING = 'UTF8' CONNECTION LIMIT = -1;" -p 5432
    
    # Chạy các scripts migration
    Write-Host "🚀 Chạy các scripts migration..." -ForegroundColor Green
    psql -h localhost -U postgres -d dmg -f .\scripts\step2_create_tables.sql -p 5432
    psql -h localhost -U postgres -d dmg -f .\scripts\alter_tables_for_binary.sql -p 5432
    
    Write-Host "✅ Migrations hoàn tất!" -ForegroundColor Green
}
