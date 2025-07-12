# QGJob Setup Script for Windows PowerShell
# This script sets up the development environment for QGJob

Write-Host "🚀 Setting up QGJob Test Orchestration System..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
    
    # Check Node.js version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Host "❌ Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if Redis is available (Docker or local)
Write-Host "🔍 Checking Redis availability..." -ForegroundColor Yellow

$redisAvailable = $false

# Try to connect to Redis
try {
    $response = Invoke-WebRequest -Uri "http://localhost:6379" -TimeoutSec 2 -ErrorAction SilentlyContinue
    $redisAvailable = $true
} catch {
    # Redis might be running but not responding to HTTP
}

# Try redis-cli if available
try {
    redis-cli ping | Out-Null
    $redisAvailable = $true
    Write-Host "✅ Redis is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Redis not detected. You can:" -ForegroundColor Yellow
    Write-Host "   1. Install Redis locally" -ForegroundColor Gray
    Write-Host "   2. Use Docker: docker run -d -p 6379:6379 redis:7-alpine" -ForegroundColor Gray
    Write-Host "   3. Use Docker Compose: docker-compose up -d redis" -ForegroundColor Gray
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm run install:all

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build projects
Write-Host "🔨 Building projects..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build projects" -ForegroundColor Red
    exit 1
}

# Setup CLI globally
Write-Host "🔧 Setting up CLI tool..." -ForegroundColor Yellow
Set-Location cli
npm link
Set-Location ..

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup CLI tool" -ForegroundColor Red
    exit 1
}

# Copy environment file
Write-Host "⚙️  Setting up environment..." -ForegroundColor Yellow
if (!(Test-Path "server\.env")) {
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "✅ Environment file created at server\.env" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start Redis (if not running):" -ForegroundColor Cyan
Write-Host "  docker run -d -p 6379:6379 redis:7-alpine" -ForegroundColor Gray
Write-Host ""
Write-Host "To start the server:" -ForegroundColor Cyan
Write-Host "  cd server && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "To test the CLI:" -ForegroundColor Cyan
Write-Host "  qgjob submit --org-id=test --app-version-id=v1.0.0 --test=tests/onboarding.spec.js" -ForegroundColor Gray
Write-Host ""
Write-Host "To check server health:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:3000/api/health" -ForegroundColor Gray
Write-Host ""
