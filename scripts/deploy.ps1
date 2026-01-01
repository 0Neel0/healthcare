# ==================================================
# HMS Docker Deployment Script (Windows)
# ==================================================
# This script starts all HMS services using Docker

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  HMS Docker Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env file" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env and add your API keys before continuing!" -ForegroundColor Yellow
        Read-Host "Press Enter after updating .env file"
    } else {
        Write-Host "❌ Error: .env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Clean up previous containers (optional)
$cleanup = Read-Host "Do you want to remove existing containers? (y/N)"
if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
    Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
    docker-compose down -v
}

# Build and start containers
Write-Host ""
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose build --no-cache

Write-Host ""
Write-Host "🚀 Starting HMS services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check container status
Write-Host ""
Write-Host "📊 Container Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  ✅ HMS Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Cyan
Write-Host "  🌐 Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "  🔧 Backend API: http://localhost:4000" -ForegroundColor White
Write-Host "  🤖 AI Service:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
