FROM node:22-alpine
RUN npm install -g pnpm@9.15.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY src/frontend/web/package.json ./src/frontend/web/
RUN pnpm install --frozen-lockfile
COPY src/frontend/web ./src/frontend/web
WORKDIR /app/src/frontend/web
EXPOSE 3000
CMD ["pnpm", "run", "dev"]
