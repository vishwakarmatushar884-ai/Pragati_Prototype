#!/usr/bin/env bash
# ==============================================================================
# PRAGATI PostgreSQL Database Automated Backup Script
# ==============================================================================
set -euo pipefail

BACKUP_DIR="./backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/pragati_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Source environment variables if present
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

DB_CONTAINER="pragati-postgres"
DB_NAME="${POSTGRES_DB:-pragati_db}"
DB_USER="${POSTGRES_USER:-pragati_user}"

echo "[*] Creating database backup for ${DB_NAME} from container ${DB_CONTAINER}..."

if docker ps | grep -q "$DB_CONTAINER"; then
    docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
    echo "[✓] Backup created successfully: $BACKUP_FILE"
    echo "[*] Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "[!] Container $DB_CONTAINER is not currently running. Cannot take backup."
    exit 1
fi

# Clean up backups older than retention period
echo "[*] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "pragati_db_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete || true
echo "[✓] Retention cleanup complete."
