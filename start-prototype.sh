#!/usr/bin/env bash
# PRAGATI 2.0 - Standalone Prototype Mode Launcher (Zero-Docker)
echo "========================================================================="
echo "  PRAGATI 2.0 - Standalone Prototype Mode (Zero-Docker / Zero-Backend)"
echo "  Cabinet Secretariat - Government of India"
echo "========================================================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo ""
echo "Launching prototype on http://localhost:5173 ..."
echo ""
npm run dev
