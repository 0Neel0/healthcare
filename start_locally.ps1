# Start Local Development Environment

$projectRoot = "C:\HMS"
Write-Host "Starting HMS System Locally from $projectRoot..." -ForegroundColor Cyan

# 1. Start Backend
Write-Host "Launching Backend (Port 4000)..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $projectRoot -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# 2. Start AI Service
Write-Host "Launching AI Service (Port 8000)..." -ForegroundColor Magenta
Start-Process powershell -WorkingDirectory $projectRoot -ArgumentList "-NoExit", "-Command", "cd ai-service; uvicorn main:app --reload --port 8000"

# 3. Start Frontend
Write-Host "Launching Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory $projectRoot -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "All services attempted to start." -ForegroundColor Cyan
Write-Host "Backend: http://localhost:4000"
Write-Host "Frontend: http://localhost:5173"
Write-Host "AI Docs: http://localhost:8000/docs"
