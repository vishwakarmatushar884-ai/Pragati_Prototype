#!/usr/bin/env bash
# ==============================================================================
# PRAGATI Let's Encrypt SSL Automated Provisioning Script
# ==============================================================================
set -euo pipefail

DOMAIN="${1:-pragati.gov.in}"
EMAIL="${2:-admin@pragati.gov.in}"

echo "========================================================"
echo " Setting up Let's Encrypt SSL Certificate for $DOMAIN"
echo "========================================================"

# Create certbot webroot directories
mkdir -p ./nginx/certbot/www ./nginx/certbot/conf

# Run Certbot container
docker run -it --rm --name certbot \
    -v "$(pwd)/nginx/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/nginx/certbot/www:/var/www/certbot" \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

echo "[✓] SSL certificate provisioned for $DOMAIN."
echo "[*] Reloading Nginx Gateway..."
docker exec pragati-gateway nginx -s reload || true
