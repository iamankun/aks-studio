# DMG Project Tools - Cài đặt công cụ
# Script này cài đặt và cấu hình tất cả các công cụ DMG Project Tools

Write-Host "🚀 Bắt đầu cài đặt DMG Project Tools..." -ForegroundColor Cyan

# Xác định đường dẫn
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path -Parent $scriptPath
$projectRoot = Split-Path -Parent $scriptDir

# Kiểm tra và tạo thư mục cần thiết
Write-Host "📂 Kiểm tra cấu trúc thư mục..." -ForegroundColor Yellow

$requiredDirs = @(
    (Join-Path -Path $projectRoot -ChildPath "scripts"),
    (Join-Path -Path $projectRoot -ChildPath "docs")
)

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path -Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Host "  ✓ Đã tạo thư mục $dir" -ForegroundColor Green
    }
}

# Đảm bảo tất cả các script đã được cài đặt
Write-Host "📋 Kiểm tra các script cần thiết..." -ForegroundColor Yellow

$requiredScripts = @{
    "generate-directory-tree.ps1" = $true
    "dmg-project-tools.ps1" = $true
    "create-desktop-shortcut.ps1" = $true
}

foreach ($script in $requiredScripts.Keys) {
    $scriptFile = Join-Path -Path $scriptDir -ChildPath $script
    
    if (-not (Test-Path -Path $scriptFile)) {
        Write-Host "  ❌ Không tìm thấy script $script" -ForegroundColor Red
        $requiredScripts[$script] = $false
    }
    else {
        Write-Host "  ✓ Đã tìm thấy script $script" -ForegroundColor Green
    }
}

# Kiểm tra xem có thiếu script nào không
$missingScripts = $requiredScripts.GetEnumerator() | Where-Object { -not $_.Value }
if ($missingScripts.Count -gt 0) {
    Write-Host "❌ Không thể tiếp tục cài đặt do thiếu các script cần thiết." -ForegroundColor Red
    exit 1
}

# Cài đặt PowerShell Module cần thiết
Write-Host "📦 Kiểm tra và cài đặt các module PowerShell cần thiết..." -ForegroundColor Yellow

$requiredModules = @("Microsoft.PowerShell.Archive")

foreach ($module in $requiredModules) {
    if (-not (Get-Module -ListAvailable -Name $module)) {
        try {
            Write-Host "  📥 Đang cài đặt module $module..." -ForegroundColor Yellow
            Install-Module -Name $module -Scope CurrentUser -Force -ErrorAction Stop
            Write-Host "  ✓ Đã cài đặt module $module" -ForegroundColor Green
        }
        catch {
            Write-Host "  ❌ Không thể cài đặt module $module: $_" -ForegroundColor Red
            Write-Host "  💡 Bạn có thể cần chạy PowerShell với quyền quản trị." -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "  ✓ Đã cài đặt module $module" -ForegroundColor Green
    }
}

# Cấu hình PowerShell Execution Policy
Write-Host "🔧 Kiểm tra và cấu hình PowerShell Execution Policy..." -ForegroundColor Yellow

$currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
if ($currentPolicy -eq "Restricted" -or $currentPolicy -eq "AllSigned") {
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "  ✓ Đã cấu hình Execution Policy thành RemoteSigned" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ Không thể cấu hình Execution Policy: $_" -ForegroundColor Red
        Write-Host "  💡 Bạn có thể cần chạy PowerShell với quyền quản trị." -ForegroundColor Yellow
    }
}
else {
    Write-Host "  ✓ Execution Policy đã được cấu hình chính xác: $currentPolicy" -ForegroundColor Green
}

# Tạo shortcut trên Desktop
Write-Host "🔗 Tạo shortcut trên Desktop..." -ForegroundColor Yellow
$shortcutScript = Join-Path -Path $scriptDir -ChildPath "create-desktop-shortcut.ps1"
& $shortcutScript

# Xuất cây thư mục dự án
Write-Host "🌳 Xuất cây thư mục dự án..." -ForegroundColor Yellow
$treeScript = Join-Path -Path $scriptDir -ChildPath "generate-directory-tree.ps1"
& $treeScript

# Hoàn tất cài đặt
Write-Host "`n✅ Cài đặt DMG Project Tools hoàn tất!" -ForegroundColor Green
Write-Host "📋 Hướng dẫn sử dụng:" -ForegroundColor Cyan
Write-Host "  1. Nhấp đúp vào shortcut 'DMG Project Tools' trên Desktop để mở ứng dụng" -ForegroundColor White
Write-Host "  2. Sử dụng các tab khác nhau để quản lý dự án DMG" -ForegroundColor White
Write-Host "  3. Các thay đổi sẽ được áp dụng trực tiếp vào dự án" -ForegroundColor White
Write-Host "`n🔍 Để xem thêm thông tin, hãy mở tài liệu hướng dẫn tại thư mục docs/" -ForegroundColor Yellow
Write-Host "🔧 Để gỡ cài đặt, chỉ cần xóa shortcut trên Desktop" -ForegroundColor Yellow

Write-Host "`nNhấn phím bất kỳ để kết thúc..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
