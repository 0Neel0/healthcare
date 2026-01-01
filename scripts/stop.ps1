# ==================================================
# HMS Docker Stop Script (Windows)
# ==================================================

Write-Host "Stopping HMS services..." -ForegroundColor Yellow
docker-compose down

Write-Host "✅ All HMS services stopped" -ForegroundColor Green
Write-Host ""
Write-Host "To remove volumes as well (WARNING: This will delete all data!):" -ForegroundColor Yellow
Write-Host "  docker-compose down -v" -ForegroundColor White
