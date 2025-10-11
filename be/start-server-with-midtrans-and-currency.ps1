# Start Server with Midtrans and Multi-Currency System for Windows
# This script starts the server with both Midtrans payment integration and multi-currency system

Write-Host "🚀 Starting Hexa Crochet Server with Midtrans & Multi-Currency..." -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the backend directory (be/)" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found. Please create one with your configuration." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if Prisma client is generated
if (-not (Test-Path "node_modules/.prisma")) {
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    npm run db:generate
}

# Check if database schema is up to date
Write-Host "🗄️ Checking database schema..." -ForegroundColor Yellow
npm run db:push

# Check if currencies are seeded
Write-Host "🌍 Checking currencies..." -ForegroundColor Yellow
try {
    npm run db:seed:currencies
} catch {
    Write-Host "⚠️ Currencies might already be seeded, continuing..." -ForegroundColor Yellow
}

# Start the server
Write-Host "🚀 Starting server with Midtrans & Multi-Currency support..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Features enabled:" -ForegroundColor Cyan
Write-Host "✅ Midtrans payment integration" -ForegroundColor Green
Write-Host "✅ Multi-currency system (IDR, USD, EUR, MYR, SGD, HKD, AED)" -ForegroundColor Green
Write-Host "✅ Automatic exchange rate updates (3x daily)" -ForegroundColor Green
Write-Host "✅ Currency conversion API" -ForegroundColor Green
Write-Host "✅ Product variant management" -ForegroundColor Green
Write-Host "✅ Image upload system" -ForegroundColor Green
Write-Host "✅ User authentication" -ForegroundColor Green
Write-Host "✅ Order management" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Server will be available at:" -ForegroundColor Cyan
Write-Host "   - Main server: http://localhost:3000" -ForegroundColor White
Write-Host "   - Health check: http://localhost:3000/health" -ForegroundColor White
Write-Host "   - API docs: http://localhost:3000/api-docs" -ForegroundColor White
Write-Host "   - Exchange rates: http://localhost:3000/api/rates" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Exchange rate updates will run at:" -ForegroundColor Cyan
Write-Host "   - 00:00 UTC (07:00 WIB)" -ForegroundColor White
Write-Host "   - 08:00 UTC (15:00 WIB)" -ForegroundColor White
Write-Host "   - 16:00 UTC (23:00 WIB)" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "==============================================================" -ForegroundColor Cyan

# Start the server
npm run dev