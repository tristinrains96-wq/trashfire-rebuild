#!/bin/bash
cd "$(dirname "$0")"

# Check for package manager
if command -v pnpm >/dev/null 2>&1; then
    PM=pnpm
elif command -v npm >/dev/null 2>&1; then
    PM=npm
else
    echo "❌ Install Node.js and pnpm or npm"
    echo "   Download Node.js from: https://nodejs.org/"
    echo "   Install pnpm: npm install -g pnpm"
    exit 1
fi

echo "🚀 Starting TrashFire..."
echo "📦 Package manager: $PM"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    $PM install
fi

# Start the application
echo "🌐 Starting development server and opening browser..."
$PM run dev:open
