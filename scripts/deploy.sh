#!/bin/bash

# ==================================================
# HMS Docker Deployment Script
# ==================================================
# This script starts all HMS services using Docker

set -e

echo "========================================="
echo "  HMS Docker Deployment"
echo "========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
        echo "⚠️  Please edit .env and add your API keys before continuing!"
        read -p "Press Enter after updating .env file..."
    else
        echo "❌ Error: .env.example not found!"
        exit 1
    fi
fi

# Clean up previous containers (optional)
read -p "Do you want to remove existing containers? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Cleaning up existing containers..."
    docker-compose down -v
fi

# Build and start containers
echo ""
echo "🔨 Building Docker images..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting HMS services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "========================================="
echo "  ✅ HMS Deployment Complete!"
echo "========================================="
echo ""
echo "Access the application at:"
echo "  🌐 Frontend:    http://localhost:5173"
echo "  🔧 Backend API: http://localhost:4000"
echo "  🤖 AI Service:  http://localhost:8000/docs"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop all services:"
echo "  docker-compose down"
echo ""
