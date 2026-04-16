#!/bin/bash

# LenDenQuick Start Script
# This script sets up the project and starts the development server

echo "🚀 LenDen- Quick Start"
echo "========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if package manager is available
if command -v pnpm &> /dev/null; then
    PM="pnpm"
elif command -v npm &> /dev/null; then
    PM="npm"
else
    echo "❌ No package manager found. Install npm or pnpm."
    exit 1
fi

echo "✅ Using package manager: $PM"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
$PM install

# Check if build is successful
echo ""
echo "🔨 Building project..."
$PM run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check errors above."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🌐 Starting development server..."
echo ""
echo "Available at: http://localhost:3000"
echo ""
echo "Quick Navigation:"
echo "  - Landing: http://localhost:3000/"
echo "  - Login: http://localhost:3000/auth/login"
echo "  - Dashboard: http://localhost:3000/dashboard"
echo "  - Admin: http://localhost:3000/admin/dashboard"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start development server
$PM dev
