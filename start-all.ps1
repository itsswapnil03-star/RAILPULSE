$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting RailMind Indian Railways AI Platform Stack   " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

Write-Host "[1/3] Starting Python FastAPI ML Service (Port 8008)..." -ForegroundColor Green
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd '$root\ml-service'; python -m uvicorn src.predict:app --port 8008 --host 0.0.0.0"

Write-Host "[2/3] Starting Node.js Express Server (Port 3008)..." -ForegroundColor Green
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd '$root\server'; node src/app.js"

Write-Host "[3/3] Starting Vite React Frontend (Port 5180)..." -ForegroundColor Green
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd '$root\client'; npm.cmd run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " All 3 microservices are launching in separate windows!" -ForegroundColor Yellow
Write-Host " Open your browser at: http://localhost:5180/control" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
