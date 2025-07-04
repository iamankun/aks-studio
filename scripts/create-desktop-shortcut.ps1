# Tạo shortcut cho DMG Project Tools trên Desktop
# Script này tạo một shortcut trên màn hình Desktop để mở DMG Project Tools

$WshShell = New-Object -ComObject WScript.Shell
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$toolsPath = Join-Path -Path $projectRoot -ChildPath "scripts\dmg-project-tools.ps1"
$iconPath = Join-Path -Path $projectRoot -ChildPath "public\favicon.ico"

# Tạo đường dẫn desktop
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path -Path $desktopPath -ChildPath "DMG Project Tools.lnk"

# Tạo shortcut
$shortcut = $WshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-ExecutionPolicy Bypass -NoProfile -File `"$toolsPath`""
$shortcut.WorkingDirectory = Split-Path -Parent $toolsPath
$shortcut.Description = "DMG Project Tools - AnKun Studio"

# Thêm icon nếu tồn tại
if (Test-Path -Path $iconPath) {
    $shortcut.IconLocation = $iconPath
}

# Lưu shortcut
$shortcut.Save()

Write-Host "✅ Đã tạo shortcut DMG Project Tools trên Desktop" -ForegroundColor Green
Write-Host "📍 Vị trí: $shortcutPath" -ForegroundColor Cyan
