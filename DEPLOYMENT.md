# PRAGATI Enterprise Production Deployment Guide
**Government of India · Cabinet Secretariat / NIC / Ministry of Electronics & Information Technology**

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & System Requirements](#2-prerequisites--system-requirements)
3. [Environment Configuration (.env)](#3-environment-configuration-env)
4. [Deployment Method A: Docker Compose (Recommended for VMs / On-Prem)](#4-deployment-method-a-docker-compose)
5. [Deployment Method B: Kubernetes & Helm (Recommended for Cloud / EKS / GKE / AKS)](#5-deployment-method-b-kubernetes--helm)
6. [Deployment Method C: Standalone Linux VPS / Systemd](#6-deployment-method-c-standalone-linux-vps--systemd)
7. [Cloud Provider Deployment Blueprints](#7-cloud-provider-deployment-blueprints)
   - [AWS (ECS / EKS + RDS)](#aws-deployment)
   - [Google Cloud (Cloud Run / GKE + Cloud SQL)](#google-cloud-deployment)
   - [Microsoft Azure (Container Apps / AKS + Azure Database)](#azure-deployment)
8. [SSL/TLS & Domain Setup with Let's Encrypt](#8-ssltls--domain-setup-with-lets-encrypt)
9. [Database Backup, Restore & Maintenance](#9-database-backup-restore--maintenance)
10. [Observability, Health Checks & Prometheus](#10-observability-health-checks--prometheus)
11. [Security Hardening Checklist](#11-security-hardening-checklist)
12. [Troubleshooting & FAQs](#12-troubleshooting--faqs)

---

## 1. Architecture Overview

```
                      +-------------------------------------------------------+
                      |         INTERNET / NIC / GOV.IN NETWORK               |
                      +-------------------------------------------------------+
                                                 |
                                  (HTTPS :443 / HTTP :80)
                                                 v
                      +-------------------------------------------------------+
                      |             NGINX EDGE GATEWAY / REVERSE PROXY         |
                      |  * SSL Termination (Let's Encrypt / Certbot)          |
                      |  * Rate Limiting (50 req/s, Burst 30)                 |
                      |  * Gzip & Security Headers (CSP, HSTS, X-Frame)       |
                      +-------------------------------------------------------+
                               /                     |                     \
                              /                      |                      \
                     (Proxy /)                 (Proxy /api/)           (Proxy /ml/)
                            /                        |                        \
                           v                         v                         v
  +--------------------------------+  +-------------------------------+  +-------------------------------+
  |        FRONTEND POD            |  |         BACKEND CORE          |  |         AI/ML SERVICE         |
  |  * React 18 SPA + Vite         |  |  * Spring Boot 3.3.2 (Java 21)|  |  * FastAPI + Python 3.11     |
  |  * Nginx Alpine Static Server  |  |  * EVM Engine & Anomaly Core  |  |  * XGBoost + Random Forest    |
  |  * Port: 80                    |  |  * Actuator Metrics & Health  |  |  * SHAP Explainability Engine |
  |  * Health: /healthz            |  |  * Port: 8080                 |  |  * Port: 8000                 |
  +--------------------------------+  +-------------------------------+  +-------------------------------+
                                                     |
                                            (JDBC / Connection Pool)
                                                     v
                                      +-------------------------------+
                                      |      POSTGRESQL 16 ENGINE     |
                                      |  * Spatial Lat/Long Indexing  |
                                      |  * Auto-Seeded Demo Data      |
                                      |  * Persistent Volume Mount    |
                                      |  * Port: 5432                 |
                                      +-------------------------------+
```

---

## 2. Prerequisites & System Requirements

### Hardware Requirements
| Deployment Size | Target Active Users | vCPU | RAM | Disk Storage |
| :--- | :--- | :--- | :--- | :--- |
| **Demo / Staging** | 1 – 50 concurrent | 2 vCPUs | 4 GB | 20 GB SSD |
| **Standard Production** | 50 – 500 concurrent | 4 vCPUs | 8 GB | 50 GB NVMe |
| **National High-Scale** | 500+ concurrent | 8+ vCPUs | 16+ GB | 100+ GB NVMe |

### Software Prerequisites
- **Docker Engine** 24.0+ & **Docker Compose** v2.20+ (for container deployment)
- **Kubectl** 1.28+ & **Helm** 3.12+ (for Kubernetes deployment)
- **Node.js 20+**, **Java 21+**, **Python 3.11+** (for bare-metal/manual deployment)

---

## 3. Environment Configuration (.env)

The platform is parameterized via the root `.env` file. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Critical Environment Variables
| Variable | Description | Production Example |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Spring active profile (`prod` or `dev`) | `prod` |
| `POSTGRES_DB` | PostgreSQL database name | `pragati_db` |
| `POSTGRES_USER` | Database username | `pragati_user` |
| `POSTGRES_PASSWORD` | Strong database password | `StrongSecretPass#2026!` |
| `JWT_SECRET` | 32+ byte HMAC-SHA256 Secret | *(Generate with `openssl rand -hex 32`)* |
| `JWT_EXPIRATION_MS` | JWT expiration time in ms | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Permitted browser origins | `https://pragati.gov.in` |
| `APP_SEED_ENABLED` | Seed demo projects on first boot | `true` (demo) or `false` (clean) |
| `ML_SERVICE_URL` | Internal URL for ML microservice | `http://ml-service:8000` |
| `DOMAIN_NAME` | Public domain for Nginx gateway | `pragati.gov.in` |

---

## 4. Deployment Method A: Docker Compose

### Option 1: Standard Stack (Zero-Setup Instant Launch)
```bash
# Clone and enter the repository
cd /opt/pragati

# Build and start all services in background
docker compose up --build -d

# Verify all services are healthy
bash scripts/health-check.sh
```
- **Web Portal:** `http://localhost` (or `http://YOUR_SERVER_IP`)
- **Backend API:** `http://localhost:8080/api`
- **Swagger Documentation:** `http://localhost:8080/swagger-ui.html`
- **ML Engine:** `http://localhost:8000/docs`

### Option 2: Production Stack with Nginx Gateway & SSL
```bash
# Run production compose file
docker compose -f docker-compose.prod.yml up --build -d
```

### Automated Linux Deployment Script
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 5. Deployment Method B: Kubernetes & Helm

### Option 1: Direct Manifests with Kustomize
```bash
# Create namespace and apply all manifests
kubectl apply -k k8s/

# Monitor rollout status
kubectl rollout status deployment/pragati-backend -n pragati
kubectl rollout status deployment/pragati-frontend -n pragati
kubectl rollout status deployment/pragati-ml-service -n pragati

# View running pods and services
kubectl get all -n pragati
```

### Option 2: Enterprise Helm Deployment
```bash
# Install or upgrade PRAGATI Helm chart
helm upgrade --install pragati ./helm/pragati \
  --namespace pragati \
  --create-namespace \
  --set global.environment=production \
  --set ingress.hosts[0].host=pragati.gov.in
```

---

## 6. Deployment Method C: Standalone Linux VPS / Systemd

For hosting on Ubuntu 22.04 / 24.04 or Debian 12 without Docker:

### 1. Install System Dependencies
```bash
sudo apt update && sudo apt install -y openjdk-21-jre-headless postgresql postgresql-contrib python3-pip python3-venv nginx
```

### 2. Setup PostgreSQL
```bash
sudo -u postgres psql -c "CREATE USER pragati_user WITH PASSWORD 'pragati_password';"
sudo -u postgres psql -c "CREATE DATABASE pragati_db OWNER pragati_user;"
```

### 3. Build Artifacts
```bash
# Backend
cd backend && mvn clean package -DskipTests
sudo mkdir -p /opt/pragati/backend/target
sudo cp target/*.jar /opt/pragati/backend/target/

# Frontend
cd ../frontend && npm install && npm run build
sudo mkdir -p /opt/pragati/frontend
sudo cp -r dist /opt/pragati/frontend/

# ML Service
cd ../ml-service
sudo cp -r . /opt/pragati/ml-service
cd /opt/pragati/ml-service
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python model/train.py
```

### 4. Enable Systemd Services
```bash
sudo cp systemd/pragati-*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pragati-ml pragati-backend

# Setup Nginx
sudo cp systemd/pragati-nginx.conf /etc/nginx/sites-available/pragati.conf
sudo ln -s /etc/nginx/sites-available/pragati.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7. Cloud Provider Deployment Blueprints

### AWS Deployment
1. **Database:** AWS RDS PostgreSQL 16 (Multi-AZ for high availability).
2. **Compute:**
   - **Option A (Container):** Amazon Elastic Container Service (ECS) Fargate with Application Load Balancer (ALB).
   - **Option B (K8s):** Amazon Elastic Kubernetes Service (EKS) using the provided Helm chart.
3. **Secrets:** AWS Secrets Manager for `JWT_SECRET` and database credentials.
4. **Storage:** Amazon EFS or EBS GP3 for persistent volumes.

### Google Cloud Deployment
1. **Database:** Cloud SQL for PostgreSQL 16.
2. **Compute:**
   - **Option A (Serverless):** Google Cloud Run for Frontend, Backend, and ML Service.
   - **Option B (K8s):** Google Kubernetes Engine (GKE) using `kubectl apply -k k8s/`.
3. **Ingress & SSL:** Google Cloud Load Balancing with Managed SSL Certificates.

### Azure Deployment
1. **Database:** Azure Database for PostgreSQL Flexible Server.
2. **Compute:** Azure Container Apps (ACA) or Azure Kubernetes Service (AKS).
3. **Secrets:** Azure Key Vault integrated via CSI driver.

---

## 8. SSL/TLS & Domain Setup with Let's Encrypt

Use the automated Let's Encrypt script to provision free, auto-renewing SSL certificates:

```bash
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh pragati.gov.in admin@pragati.gov.in
```

Certbot will automatically verify domain ownership and configure Nginx HTTPS on Port 443.

---

## 9. Database Backup, Restore & Maintenance

### Take Immediate Automated Backup
```bash
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```
Backups are saved to `./backups/postgres/pragati_db_YYYYMMDD_HHMMSS.sql.gz` and automatically purged after 30 days.

### Restore Database from Backup
```bash
chmod +x scripts/restore-db.sh
./scripts/restore-db.sh ./backups/postgres/pragati_db_20260921_120000.sql.gz
```

### Setup Daily Automated Cronjob
Add this to `/etc/crontab` or `crontab -e`:
```bash
0 2 * * * root /opt/pragati/scripts/backup-db.sh > /var/log/pragati-backup.log 2>&1
```

---

## 10. Observability, Health Checks & Prometheus

PRAGATI includes native health checks and Prometheus metrics endpoints:

### Endpoint Catalog
| Endpoint | Method | Purpose | Sample Response |
| :--- | :--- | :--- | :--- |
| `/healthz` | `GET` | Gateway & Frontend Liveness | `200 "healthy"` |
| `/actuator/health` | `GET` | Backend Core Status | `{"status":"UP","components":{"db":{"status":"UP"}}}` |
| `/actuator/health/liveness` | `GET` | Kubernetes Liveness Probe | `{"status":"UP"}` |
| `/actuator/health/readiness` | `GET` | Kubernetes Readiness Probe | `{"status":"UP"}` |
| `/actuator/metrics` | `GET` | JVM, GC, Hikari Connection Pool | Metrics List |
| `/actuator/prometheus` | `GET` | Prometheus Scrape Target | OpenMetrics Format |
| `/ml/health` | `GET` | ML Model Availability Check | `{"status":"UP","models_loaded":true}` |

### Prometheus Scrape Configuration
Add to your `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'pragati-backend'
    metrics_path: '/actuator/prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['backend:8080']
```

---

## 11. Security Hardening Checklist

- [x] **Non-Root Containers:** Backend and ML Docker containers run under unprivileged system users (`spring:spring` UID 1001, `mluser:mluser` UID 1000).
- [x] **Rate Limiting:** Nginx Gateway restricts burst traffic to 50 req/s to prevent DoS attacks.
- [x] **Security HTTP Headers:** `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] **Connection Pool Safety:** HikariCP connection timeout (30s) and leak detection (60s).
- [x] **CORS Origin Validation:** Configurable whitelist preventing unauthorized cross-origin API calls.
- [x] **Stateless JWT:** Ephemeral cryptographically signed HS256 tokens with role-based claims.
- [x] **Tamper-Proof Audit Log:** Immutable audit trail in PostgreSQL for all project modifications.

---

## 12. Troubleshooting & FAQs

### Q1: The backend container fails to connect to PostgreSQL.
**Solution:** Verify PostgreSQL is healthy. In Docker Compose, the backend waits for `postgres` to pass the `pg_isready` health check. Check logs:
```bash
docker logs pragati-postgres
```

### Q2: How do I change the demo admin password?
**Solution:** In `DataSeedService.java` or via the database:
```sql
UPDATE users SET password = '<NEW_BCRYPT_HASH>' WHERE email = 'admin@pragati.demo';
```

### Q3: ML Service returns 500 when predicting risk.
**Solution:** Verify that model weights exist in `ml-service/models/`. You can re-train models at any time with:
```bash
cd ml-service && python model/train.py
```

### Q4: Frontend shows "Network Error" when calling APIs.
**Solution:** Check if `VITE_API_URL` is set to `/api`. If deploying across separate hostnames, ensure `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend domain.

---

*PRAGATI Enterprise Platform · Maintained by National Project Governance Team*
