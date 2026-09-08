# RailPulse Demo Startup Script

# 1. Start Backend
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd backend; python -m venv .venv; .\.venv\Scripts\activate.ps1; pip install -r requirements.txt; uvicorn app.main:app --reload'

# 2. Start Frontend
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd frontend; npm install; npm run dev'

Write-Host "RailPulse is starting..."
Write-Host "Backend: http://127.0.0.1:8000"
Write-Host "Frontend: http://localhost:5173"
