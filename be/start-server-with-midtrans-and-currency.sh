#!/bin/bash

# Start Server with Midtrans and Multi-Currency System
# This script starts the server with both Midtrans payment integration and multi-currency system

echo "🚀 Starting Hexa Crochet Server with Midtrans & Multi-Currency..."
echo "=============================================================="

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

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    npm run db:generate
fi

# Check if database schema is up to date
echo "🗄️ Checking database schema..."
npm run db:push

# Check if currencies are seeded
echo "🌍 Checking currencies..."
if ! npm run db:seed:currencies 2>/dev/null; then
    echo "⚠️ Currencies might already be seeded, continuing..."
fi

# Start the server
echo "🚀 Starting server with Midtrans & Multi-Currency support..."
echo ""
echo "📋 Features enabled:"
echo "✅ Midtrans payment integration"
echo "✅ Multi-currency system (IDR, USD, EUR, MYR, SGD, HKD, AED)"
echo "✅ Automatic exchange rate updates (3x daily)"
echo "✅ Currency conversion API"
echo "✅ Product variant management"
echo "✅ Image upload system"
echo "✅ User authentication"
echo "✅ Order management"
echo ""
echo "🌐 Server will be available at:"
echo "   - Main server: http://localhost:3000"
echo "   - Health check: http://localhost:3000/health"
echo "   - API docs: http://localhost:3000/api-docs"
echo "   - Exchange rates: http://localhost:3000/api/rates"
echo ""
echo "🔄 Exchange rate updates will run at:"
echo "   - 00:00 UTC (07:00 WIB)"
echo "   - 08:00 UTC (15:00 WIB)"
echo "   - 16:00 UTC (23:00 WIB)"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=============================================================="

# Start the server
npm run dev
