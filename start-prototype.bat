@echo off
title PRAGATI Standalone Prototype Mode (Zero-Docker)
echo =========================================================================
echo   PRAGATI 2.0 - Standalone Prototype Mode (Zero-Docker / Zero-Backend)
echo   Cabinet Secretariat - Government of India
echo =========================================================================
echo.
echo Starting interactive prototype dashboard with built-in National Demo Data...
echo.

cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm.cmd install
)

echo.
echo Launching prototype on http://localhost:5173 ...
echo.
call npm.cmd run dev
