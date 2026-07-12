FROM node:22-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Create directories and set permissions
RUN mkdir -p /app/node_modules /app/src/frontend/web/node_modules && chown -R appuser:appgroup /app

# Copy entrypoint script (runs as root)
COPY docker/web-entrypoint.sh /usr/local/bin/web-entrypoint.sh
RUN chmod +x /usr/local/bin/web-entrypoint.sh

# Copy lockfile and manifest first (cache layer)
COPY --chown=appuser:appgroup package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=appuser:appgroup src/frontend/web/package.json ./src/frontend/web/

EXPOSE 3000

WORKDIR /app/src/frontend/web

# Run entrypoint as root (to fix permissions), then switch to appuser for dev server
ENTRYPOINT ["/usr/local/bin/web-entrypoint.sh"]