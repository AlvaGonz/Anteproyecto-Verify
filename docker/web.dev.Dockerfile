FROM node:22-alpine

RUN npm install -g pnpm@9.15.0

WORKDIR /app
RUN chown -R node:node /app

USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY --chown=node:node src/frontend/web/package.json ./src/frontend/web/
RUN pnpm install --frozen-lockfile
COPY --chown=node:node src/frontend/web ./src/frontend/web

WORKDIR /app/src/frontend/web
EXPOSE 3000
CMD ["pnpm", "run", "dev"]
