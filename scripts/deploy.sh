#!/usr/bin/env bash
# ==============================================================================
# PRAGATI Zero-Downtime Production Deployment Script
# ==============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}  PRAGATI Enterprise Production Deployment Script  ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}[!] .env file not found. Copying from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}[✓] Created .env from template. Review secrets before running in production!${NC}"
fi

# Step 1: Pre-flight Check
echo -e "\n${BLUE}--> Step 1: Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}[✗] Docker is not installed.${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1 || { echo -e "${RED}[✗] Docker Compose is not installed.${NC}"; exit 1; }
echo -e "${GREEN}[✓] Docker and Docker Compose verified.${NC}"

# Determine Compose Command
if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Step 2: Database Backup Before Deployment
echo -e "\n${BLUE}--> Step 2: Creating automated database pre-deployment backup...${NC}"
if [ -f scripts/backup-db.sh ]; then
    chmod +x scripts/backup-db.sh
    ./scripts/backup-db.sh || echo -e "${YELLOW}[!] Pre-deployment backup skipped (DB might not be running yet).${NC}"
fi

# Step 3: Build and Pull Images
echo -e "\n${BLUE}--> Step 3: Building and updating Docker containers...${NC}"
$COMPOSE_CMD build --pull

# Step 4: Launching Stack with Rolling Updates
echo -e "\n${BLUE}--> Step 4: Starting containers with health dependencies...${NC}"
$COMPOSE_CMD up -d --remove-orphans

# Step 5: Wait for Services Health Check
echo -e "\n${BLUE}--> Step 5: Waiting for services to become healthy...${NC}"
for i in {1..20}; do
    BACKEND_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' pragati-backend 2>/dev/null || echo '"starting"')
    ML_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' pragati-ml-service 2>/dev/null || echo '"starting"')
    FRONTEND_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' pragati-frontend 2>/dev/null || echo '"starting"')
    
    echo -e "Health Check [Attempt $i/20] - Backend: $BACKEND_STATUS | ML: $ML_STATUS | Frontend: $FRONTEND_STATUS"
    
    if [ "$BACKEND_STATUS" = '"healthy"' ] && [ "$ML_STATUS" = '"healthy"' ] && [ "$FRONTEND_STATUS" = '"healthy"' ]; then
        echo -e "\n${GREEN}====================================================${NC}"
        echo -e "${GREEN}  ✓ PRAGATI Platform is Healthy & Deployed!         ${NC}"
        echo -e "${GREEN}====================================================${NC}"
        echo -e "Frontend Portal:  http://localhost"
        echo -e "Backend API:      http://localhost:8080 (Swagger: /swagger-ui.html)"
        echo -e "ML Microservice:  http://localhost:8000 (Swagger: /docs)"
        echo -e "Actuator Health:  http://localhost:8080/actuator/health"
        exit 0
    fi
    sleep 5
done

echo -e "\n${YELLOW}[!] Some services took longer than expected to report healthy.${NC}"
echo -e "Run: ${COMPOSE_CMD} logs -f to monitor service logs."
