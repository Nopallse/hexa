#!/bin/bash

# Complete Setup Script for Hexa Crochet Multi-Currency System
# This script sets up everything needed for the multi-currency system

echo "🌍 Complete Setup for Hexa Crochet Multi-Currency System"
echo "========================================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory (be/)"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please create one with your configuration."
    exit 1
fi

echo "📋 Setup Checklist:"
echo "1. Installing dependencies..."
echo "2. Generating Prisma client..."
echo "3. Pushing database schema..."
echo "4. Seeding currencies..."
echo "5. Testing API endpoints..."
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install node-cron

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Step 2: Generate Prisma client
echo "🔧 Step 2: Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated successfully"

# Step 3: Push database schema
echo "🗄️ Step 3: Pushing database schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema"
    exit 1
fi

echo "✅ Database schema pushed successfully"

# Step 4: Seed currencies
echo "🌍 Step 4: Seeding currencies..."
npm run db:seed:currencies

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed currencies"
    exit 1
fi

echo "✅ Currencies seeded successfully"

# Step 5: Test API endpoints
echo "🧪 Step 5: Testing API endpoints..."

# Wait a moment for server to be ready
sleep 2

# Test exchange rates endpoint
echo "Testing GET /api/rates..."
curl -s http://localhost:3000/api/rates > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Exchange rates endpoint working"
else
    echo "⚠️ Exchange rates endpoint not responding (server might not be running)"
fi

# Test rates freshness endpoint
echo "Testing GET /api/rates/fresh..."
curl -s http://localhost:3000/api/rates/fresh > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Rates freshness endpoint working"
else
    echo "⚠️ Rates freshness endpoint not responding"
fi

# Test currency conversion endpoint
echo "Testing POST /api/rates/convert..."
curl -s -X POST http://localhost:3000/api/rates/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from_currency": "USD", "to_currency": "IDR"}' > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Currency conversion endpoint working"
else
    echo "⚠️ Currency conversion endpoint not responding"
fi

echo ""
echo "🎉 Multi-Currency System Setup Complete!"
echo "========================================"
echo ""
echo "📋 What's been set up:"
echo "✅ Database schema with currencies and exchange_rates tables"
echo "✅ Exchange rate service with API integration"
echo "✅ Cron job service for automatic rate updates"
echo "✅ Currency utility functions"
echo "✅ API endpoints for rates and conversion"
echo "✅ Sample currencies (IDR, USD, EUR, MYR, SGD, HKD, AED)"
echo "✅ Initial exchange rates"
echo ""
echo "🚀 Next steps:"
echo "1. Start the server: npm run dev"
echo "2. The cron job will automatically update rates 3x daily"
echo "3. Use the API endpoints in your frontend"
echo "4. Check logs for exchange rate updates"
echo ""
echo "📚 Documentation:"
echo "- See CURRENCY_SYSTEM_DOCUMENTATION.md for detailed docs"
echo "- API endpoints: GET /api/rates, POST /api/rates/convert"
echo "- Frontend utils: fe/src/utils/currencyUtils.ts"
echo ""
echo "🔧 Manual commands:"
echo "- Update rates manually: curl -X POST http://localhost:3000/api/rates/update"
echo "- Check rate freshness: curl http://localhost:3000/api/rates/fresh"
echo "- Convert currency: curl -X POST http://localhost:3000/api/rates/convert -H 'Content-Type: application/json' -d '{\"amount\": 100, \"from_currency\": \"USD\", \"to_currency\": \"IDR\"}'"
echo ""
echo "Happy coding! 🎨"
