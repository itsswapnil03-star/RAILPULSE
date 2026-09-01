$ErrorActionPreference = "Stop"

Write-Host "========================================="
Write-Host " Starting RailMind 3-Service Hackathon Stack "
Write-Host "========================================="

Write-Host "1. Starting RailMind ML Service (FastAPI :8000)..."
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd ml-service; python -m uvicorn src.predict:app --port 8000"

Write-Host "2. Starting RailMind Express Server (Node :5000)..."
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd server; npm.cmd run dev"

Write-Host "3. Starting RailMind React Client (Vite :5173)..."
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd client; npm.cmd run dev"

Write-Host "All 3 services are launching in dedicated terminal windows!"
Write-Host "Open your browser at http://localhost:5173"
