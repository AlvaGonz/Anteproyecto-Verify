FROM node:22-alpine AS build
RUN npm install -g pnpm@9.15.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY src/frontend/web/package.json ./src/frontend/web/
RUN pnpm install --frozen-lockfile
COPY src/frontend/web/ ./src/frontend/web/
WORKDIR /app/src/frontend/web
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/src/frontend/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
