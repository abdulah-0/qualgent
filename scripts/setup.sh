#!/bin/bash

# QGJob Setup Script
# This script sets up the development environment for QGJob

set -e

echo "🚀 Setting up QGJob Test Orchestration System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Redis is running
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis CLI not found. Installing Redis..."
    
    # Detect OS and install Redis
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install redis
            brew services start redis
        else
            echo "❌ Homebrew not found. Please install Redis manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt update
        sudo apt install -y redis-server
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
    else
        echo "❌ Unsupported OS. Please install Redis manually."
        exit 1
    fi
else
    echo "✅ Redis detected"
fi

# Test Redis connection
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running. Please start Redis first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build projects
echo "🔨 Building projects..."
npm run build

# Setup CLI globally
echo "🔧 Setting up CLI tool..."
cd cli
npm link
cd ..

# Copy environment file
echo "⚙️  Setting up environment..."
if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo "✅ Environment file created at server/.env"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  cd server && npm run dev"
echo ""
echo "To test the CLI:"
echo "  qgjob submit --org-id=test --app-version-id=v1.0.0 --test=tests/onboarding.spec.js"
echo ""
echo "To check server health:"
echo "  curl http://localhost:3000/api/health"
echo ""
