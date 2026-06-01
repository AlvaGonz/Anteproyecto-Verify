FROM node:22-alpine AS build
WORKDIR /app
COPY src/frontend/web/package*.json ./
RUN npm install
COPY src/frontend/web/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
