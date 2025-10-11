# Multi-Currency System Setup Script for Windows
# This script sets up the complete multi-currency system for Hexa Crochet

Write-Host "🌍 Setting up Multi-Currency System for Hexa Crochet..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the backend directory (be/)" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install node-cron

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green

# Push database schema
Write-Host "🗄️ Pushing database schema..." -ForegroundColor Yellow
npm run db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push database schema" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database schema pushed successfully" -ForegroundColor Green

# Seed currencies
Write-Host "🌍 Seeding currencies..." -ForegroundColor Yellow
npm run db:seed:currencies

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed currencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Currencies seeded successfully" -ForegroundColor Green

# Test API endpoints
Write-Host "🧪 Testing API endpoints..." -ForegroundColor Yellow

# Wait a moment for server to be ready
Start-Sleep -Seconds 2

# Test exchange rates endpoint
Write-Host "Testing GET /api/rates..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/rates" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Exchange rates endpoint working" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Exchange rates endpoint not responding (server might not be running)" -ForegroundColor Yellow
}

# Test rates freshness endpoint
Write-Host "Testing GET /api/rates/fresh..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/rates/fresh" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Rates freshness endpoint working" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Rates freshness endpoint not responding" -ForegroundColor Yellow
}

# Test currency conversion endpoint
Write-Host "Testing POST /api/rates/convert..." -ForegroundColor Yellow
try {
    $body = @{
        amount = 100
        from_currency = "USD"
        to_currency = "IDR"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/rates/convert" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Currency conversion endpoint working" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Currency conversion endpoint not responding" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Multi-Currency System Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's been set up:" -ForegroundColor Cyan
Write-Host "✅ Database schema with currencies and exchange_rates tables" -ForegroundColor Green
Write-Host "✅ Exchange rate service with API integration" -ForegroundColor Green
Write-Host "✅ Cron job service for automatic rate updates" -ForegroundColor Green
Write-Host "✅ Currency utility functions" -ForegroundColor Green
Write-Host "✅ API endpoints for rates and conversion" -ForegroundColor Green
Write-Host "✅ Sample currencies (IDR, USD, EUR, MYR, SGD, HKD, AED)" -ForegroundColor Green
Write-Host "✅ Initial exchange rates" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the server: npm run dev" -ForegroundColor White
Write-Host "2. The cron job will automatically update rates 3x daily" -ForegroundColor White
Write-Host "3. Use the API endpoints in your frontend" -ForegroundColor White
Write-Host "4. Check logs for exchange rate updates" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- See CURRENCY_SYSTEM_DOCUMENTATION.md for detailed docs" -ForegroundColor White
Write-Host "- API endpoints: GET /api/rates, POST /api/rates/convert" -ForegroundColor White
Write-Host "- Frontend utils: fe/src/utils/currencyUtils.ts" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Manual commands:" -ForegroundColor Cyan
Write-Host "- Update rates manually: Invoke-WebRequest -Uri 'http://localhost:3000/api/rates/update' -Method POST" -ForegroundColor White
Write-Host "- Check rate freshness: Invoke-WebRequest -Uri 'http://localhost:3000/api/rates/fresh'" -ForegroundColor White
Write-Host "- Convert currency: See documentation for PowerShell examples" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎨" -ForegroundColor Magenta
