# PowerShell Development script - Tôi là An Kun

Write-Host "🎵 Starting AKs Studio CMS Development Server..." -ForegroundColor Cyan
Write-Host "📍 Location: $(Get-Location)" -ForegroundColor Yellow
Write-Host "🔧 Node Version: $(node --version)" -ForegroundColor Green
Write-Host "📦 NPM Version: $(npm --version)" -ForegroundColor Green

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found! Please create it from .env.example" -ForegroundColor Red
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ Created .env.local from .env.example" -ForegroundColor Green
    }
}

# Check database connection
Write-Host "🔍 Checking system status..." -ForegroundColor Cyan

# Start development server
Write-Host "🚀 Starting Next.js development server..." -ForegroundColor Green
Write-Host "🌐 Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "👤 Login with: ankunstudio / admin" -ForegroundColor Yellow

npm run dev