FROM node:22-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

RUN mkdir -p /app/node_modules && chown -R appuser:appgroup /app

USER appuser

# Copy lockfile and manifest first (cache layer)
COPY --chown=appuser:appgroup package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=appuser:appgroup src/frontend/web/package.json ./src/frontend/web/

# Install dependencies with frozen lockfile and increased memory for Node
RUN NODE_OPTIONS="--max-old-space-size=1024" pnpm install --filter web-frontend --frozen-lockfile

# Copy the rest of the workspace source code
COPY --chown=appuser:appgroup src/frontend/web ./src/frontend/web

EXPOSE 3000

WORKDIR /app/src/frontend/web

CMD ["pnpm", "run", "dev"]
