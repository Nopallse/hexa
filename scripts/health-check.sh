#!/bin/bash

echo "🔍 Hexa Application Health Check"
echo "================================="

# Check PM2 processes
echo "📊 PM2 Process Status:"
pm2 status

echo ""
echo "🌐 API Health Check:"

# Wait a moment for PM2 to fully restart
sleep 5

# Check if API is responding
API_URL="http://localhost:3000"
HEALTH_ENDPOINT="$API_URL/api/health"

# Try to curl the health endpoint
if curl -f -s $HEALTH_ENDPOINT > /dev/null; then
    echo "✅ API is responding at $API_URL"
else
    echo "❌ API is not responding at $API_URL"
    echo "📋 Checking PM2 logs for errors:"
    pm2 logs hexa-api --lines 10
    exit 1
fi

echo ""
echo "📁 Frontend Build Check:"
if [ -d "fe/dist" ]; then
    echo "✅ Frontend build exists"
    echo "📊 Build size: $(du -sh fe/dist | cut -f1)"
else
    echo "❌ Frontend build not found"
fi

echo ""
echo "🎉 Health check completed!"
echo "🌍 Application should be available at your domain"