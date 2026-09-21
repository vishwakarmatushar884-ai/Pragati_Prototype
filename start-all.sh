#!/usr/bin/env bash
# ==============================================================================
# PRAGATI Multi-Service Local Development Launcher (Linux & macOS)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================================="
echo "  Starting PRAGATI Full-Stack Platform..."
echo "========================================================================="

# Trap INT/TERM to terminate background jobs cleanly
cleanup() {
    echo -e "\nShutting down PRAGATI services..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Python ML Microservice
echo "[1/3] Starting Python ML Service (Port 8000)..."
cd "$SCRIPT_DIR/ml-service"
if [ -d "venv" ]; then
    source venv/bin/activate
fi
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
ML_PID=$!

sleep 2

# 2. Start Spring Boot Backend
echo "[2/3] Starting Spring Boot Backend (Port 8080)..."
cd "$SCRIPT_DIR/backend"
mvn spring-boot:run &
BACKEND_PID=$!

sleep 3

# 3. Start React Frontend
echo "[3/3] Starting React Frontend (Port 5173)..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================================================="
echo "  PRAGATI Services Launched!"
echo "  - Frontend:   http://localhost:5173"
echo "  - Backend:    http://localhost:8080 (Swagger: /swagger-ui.html)"
echo "  - ML Service: http://localhost:8000 (Docs: /docs)"
echo "========================================================================="
echo "Press Ctrl+C to terminate all services."
echo ""

wait
