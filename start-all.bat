@echo off
echo Starting PRAGATI Full-Stack Platform Platform...
echo.

start "PRAGATI - Python ML Service (Port 8000)" cmd /k "cd /d %~dp0ml-service && if exist venv\Scripts\activate (call venv\Scripts\activate) && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

start "PRAGATI - Spring Boot Backend (Port 8080)" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

timeout /t 5 /nobreak >nul

start "PRAGATI - React Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo =========================================================================
echo  PRAGATI Services Launched!
echo  - Frontend:   http://localhost:5173
echo  - Backend:    http://localhost:8080 (Swagger: /swagger-ui.html)
echo  - ML Service: http://localhost:8000 (Docs: /docs)
echo =========================================================================
echo.
