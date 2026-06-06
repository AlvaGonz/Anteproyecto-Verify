FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We don't copy the rest here, we will mount it as a volume in docker-compose
EXPOSE 3000
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser
CMD ["npm", "run", "dev"]
