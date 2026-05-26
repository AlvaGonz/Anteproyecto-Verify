FROM node:22-alpine

RUN npm install -g pnpm@9.15.0

WORKDIR /app
# Pre-create node_modules dirs with node ownership so named volumes
# get the correct permissions on first mount
RUN mkdir -p /app/node_modules /app/src/frontend/web/node_modules \
    && chown -R node:node /app

# Copy entrypoint script before switching to USER node
COPY docker/web-entrypoint.sh /app/web-entrypoint.sh
RUN chmod +x /app/web-entrypoint.sh && chown node:node /app/web-entrypoint.sh

USER node

# Only copy manifests first for layer-cache efficiency
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY --chown=node:node src/frontend/web/package.json ./src/frontend/web/

# Source code is mounted at runtime via volume; no COPY needed for dev
WORKDIR /app/src/frontend/web
EXPOSE 3000

# Entrypoint re-installs node_modules inside the container (Linux-native)
# then starts Vite. This bypasses broken Windows symlinks from the bind mount.
ENTRYPOINT ["/app/web-entrypoint.sh"]
