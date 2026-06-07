FROM node:22-alpine

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

RUN mkdir -p /app/node_modules && chown -R appuser:appgroup /app

USER appuser

COPY --chown=appuser:appgroup package*.json ./
RUN npm install

COPY --chown=appuser:appgroup . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
