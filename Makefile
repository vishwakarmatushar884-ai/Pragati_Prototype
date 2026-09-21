.PHONY: help dev build test docker-up docker-down docker-prod k8s-deploy k8s-delete backup health clean

help:
	@echo "========================================================================"
	@echo " PRAGATI Enterprise Command Line Management"
	@echo "========================================================================"
	@echo " make dev          - Run all services locally (Frontend + Backend + ML)"
	@echo " make build        - Build production artifacts for all services"
	@echo " make test         - Run full test suites across frontend, backend & ML"
	@echo " make docker-up    - Build and launch Docker Compose stack"
	@echo " make docker-down  - Stop and clean Docker Compose stack"
	@echo " make docker-prod  - Launch production Compose stack with Nginx Gateway"
	@echo " make k8s-deploy   - Deploy stack to Kubernetes via Kustomize"
	@echo " make k8s-delete   - Tear down Kubernetes namespace and resources"
	@echo " make backup       - Create instant PostgreSQL backup"
	@echo " make health       - Run multi-tier health checks"
	@echo " make clean        - Clean temporary build directories and caches"

dev:
	@./start-all.sh

build:
	@echo "==> Building Frontend..."
	cd frontend && npm run build
	@echo "==> Building Backend..."
	cd backend && mvn clean package -DskipTests
	@echo "==> Training/Verifying ML Models..."
	cd ml-service && python model/train.py

test:
	@echo "==> Testing Backend..."
	cd backend && mvn test
	@echo "==> Testing Frontend..."
	cd frontend && npm run build
	@echo "==> Testing ML Service..."
	cd ml-service && python model/train.py

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-prod:
	docker compose -f docker-compose.prod.yml up --build -d

k8s-deploy:
	kubectl apply -k k8s/

k8s-delete:
	kubectl delete -k k8s/

backup:
	@bash scripts/backup-db.sh

health:
	@bash scripts/health-check.sh

clean:
	rm -rf frontend/dist backend/target backups/postgres/*.tmp
