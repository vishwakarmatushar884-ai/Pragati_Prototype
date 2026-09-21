#!/usr/bin/env bash
# ==============================================================================
# PRAGATI PostgreSQL Database Restore Script
# ==============================================================================
set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "Usage: $0 <path_to_backup_file.sql.gz>"
    echo "Example: $0 ./backups/postgres/pragati_db_20260921_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: File $BACKUP_FILE does not exist."
    exit 1
fi

# Source environment variables if present
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

DB_CONTAINER="pragati-postgres"
DB_NAME="${POSTGRES_DB:-pragati_db}"
DB_USER="${POSTGRES_USER:-pragati_user}"

echo "WARNING: This will overwrite the current database '${DB_NAME}'!"
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "[*] Restoring database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
echo "[✓] Database restoration complete."
