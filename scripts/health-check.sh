#!/usr/bin/env bash
# ==============================================================================
# PRAGATI Multi-Tier Health Check CLI
# ==============================================================================
set -u

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FRONTEND_URL="${FRONTEND_URL:-http://localhost}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
ML_URL="${ML_URL:-http://localhost:8000}"

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}       PRAGATI Multi-Tier Service Health Check        ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check Frontend
echo -n "1. Checking Frontend ($FRONTEND_URL/healthz)... "
if curl -s -f -m 5 "$FRONTEND_URL/healthz" >/dev/null 2>&1; then
    echo -e "${GREEN}[UP - 200 OK]${NC}"
else
    echo -e "${RED}[DOWN]${NC}"
fi

# Check Backend Spring Boot Actuator
echo -n "2. Checking Backend Core ($BACKEND_URL/actuator/health)... "
BACKEND_RESP=$(curl -s -m 5 "$BACKEND_URL/actuator/health" 2>/dev/null || echo "")
if echo "$BACKEND_RESP" | grep -q '"status":"UP"'; then
    echo -e "${GREEN}[UP - Service Ready]${NC}"
else
    echo -e "${RED}[DOWN or Unhealthy]${NC}"
fi

# Check ML Service
echo -n "3. Checking AI/ML Engine ($ML_URL/ml/health)... "
ML_RESP=$(curl -s -m 5 "$ML_URL/ml/health" 2>/dev/null || echo "")
if echo "$ML_RESP" | grep -q '"status":"UP"'; then
    echo -e "${GREEN}[UP - Models Loaded]${NC}"
else
    echo -e "${RED}[DOWN or Models Not Loaded]${NC}"
fi

# Check Docker Container States if Docker is running
if command -v docker >/dev/null 2>&1; then
    echo -e "\n${BLUE}--> Docker Container Statuses:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "pragati|NAMES" || true
fi

echo -e "${BLUE}======================================================${NC}"
