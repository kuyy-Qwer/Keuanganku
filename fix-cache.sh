#!/bin/bash

# Fix Cache Issues - Mac/Linux

echo ""
echo "🔥 Fixing cache issues..."
echo ""

# Stop any running node processes
echo "📛 Stopping Node.js processes..."
killall node 2>/dev/null || true
sleep 2

# Clear Vite cache
echo "🗑️  Clearing Vite cache..."
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "✅ Vite cache cleared"
else
    echo "ℹ️  No Vite cache found"
fi

# Clear dist folder
echo "🗑️  Clearing dist folder..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "✅ Dist folder cleared"
else
    echo "ℹ️  No dist folder found"
fi

# Clear npm cache
echo "🗑️  Clearing npm cache..."
npm cache clean --force

echo ""
echo "✅ Cache cleared successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Run: npm run dev"
echo "2. Open browser and press Ctrl + Shift + Delete (Cmd + Shift + Delete on Mac)"
echo "3. Clear 'Cached images and files'"
echo "4. Hard reload browser (Ctrl + Shift + R or Cmd + Shift + R)"
echo ""
