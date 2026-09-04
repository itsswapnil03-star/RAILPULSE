@echo off
title RailMind - Starting All 3 Services
echo ========================================================
echo   Starting RailMind Indian Railways AI Platform Stack   
echo ========================================================
echo.

echo [1/3] Starting Python FastAPI ML Service on Port 8008...
start "RailMind ML Service (8008)" cmd /k "cd /d %~dp0ml-service && python -m uvicorn src.predict:app --port 8008 --host 0.0.0.0"

echo [2/3] Starting Node.js Express Server on Port 3008...
start "RailMind Server (3008)" cmd /k "cd /d %~dp0server && node src/app.js"

echo [3/3] Starting Vite React Frontend on Port 5180...
start "RailMind Frontend (5180)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================================
echo  All 3 services are launching in separate windows!
echo  Open your browser at: http://localhost:5180/control
echo ========================================================
pause
