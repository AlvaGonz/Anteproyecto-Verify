FROM node:20-alpine

# Pin Azurite to an exact version for reproducible builds
RUN npm install -g azurite@3.30.0 --no-fund --no-audit

# Create a dedicated non-root user
RUN addgroup --system azurite && adduser --system --ingroup azurite azurite

# Persistent data directory with correct ownership
RUN mkdir -p /data && chown azurite:azurite /data

WORKDIR /data

USER azurite

# Blob / Queue / Table ports
EXPOSE 10000 10001 10002

CMD ["azurite", \
     "--blobHost",  "0.0.0.0", \
     "--queueHost", "0.0.0.0", \
     "--tableHost", "0.0.0.0", \
     "--location",  "/data", \
     "--loose"]
