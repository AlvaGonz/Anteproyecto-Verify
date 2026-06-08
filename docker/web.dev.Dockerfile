FROM node:22-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

RUN mkdir -p /app/node_modules && chown -R appuser:appgroup /app

USER appuser

# Copy lockfile and manifest first (cache layer)
COPY --chown=appuser:appgroup package.json pnpm-lock.yaml ./

# Install with frozen lockfile — reproducible and pnpm-only
RUN pnpm install --frozen-lockfile

COPY --chown=appuser:appgroup . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
