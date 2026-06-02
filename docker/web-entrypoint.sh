#!/bin/sh
set -e

echo "[web-entrypoint] Installing node_modules inside container..."
cd /app
pnpm install --frozen-lockfile --ignore-scripts

echo "[web-entrypoint] Starting Vite dev server..."
cd /app/src/frontend/web
exec pnpm run dev
