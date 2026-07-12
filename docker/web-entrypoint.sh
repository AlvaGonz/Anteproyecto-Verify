#!/bin/sh
set -e

echo "[Web] Fixing permissions..."
# Fix ownership of node_modules and package directories
chown -R appuser:appgroup /app/node_modules 2>/dev/null || true
chown -R appuser:appgroup /app/src/frontend/web/node_modules 2>/dev/null || true
chown -R appuser:appgroup /app/src/frontend/web 2>/dev/null || true

echo "[Web] Installing dependencies..."
cd /app
NODE_OPTIONS="--max-old-space-size=1024" pnpm install --filter web-frontend --frozen-lockfile

echo "[Web] Starting Vite dev server..."
cd /app/src/frontend/web
exec pnpm run dev