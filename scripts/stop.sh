#!/bin/bash

# ==================================================
# HMS Docker Stop Script
# ==================================================

echo "Stopping HMS services..."
docker-compose down

echo "✅ All HMS services stopped"
echo ""
echo "To remove volumes as well (WARNING: This will delete all data!):"
echo "  docker-compose down -v"
