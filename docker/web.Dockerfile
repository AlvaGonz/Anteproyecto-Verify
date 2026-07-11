## ── Stage 1: Install Dependencies ───────────────────────────────────────────
FROM node:22-alpine AS deps

# Enable pnpm via corepack — pin version for reproducible installs
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy only manifests first to maximise cache reuse
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY src/frontend/web/package.json ./src/frontend/web/

# Frozen lockfile prevents accidental resolution changes in CI/CD
RUN pnpm install --filter web-frontend --frozen-lockfile --prod=false

## ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM deps AS build

COPY src/frontend/web ./src/frontend/web

WORKDIR /app/src/frontend/web

RUN pnpm run build

## ── Stage 3: Production Nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/src/frontend/web/dist /usr/share/nginx/html

# Custom nginx config: gzip, cache headers, SPA fallback
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# nginx:alpine already runs as uid 101 (nginx); no extra USER needed
CMD ["nginx", "-g", "daemon off;"]
