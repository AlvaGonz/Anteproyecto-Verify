FROM node:20-alpine

# Install Azurite globally via npm
RUN npm install -g azurite@3.30.0

# Create and set the data directory
WORKDIR /data

# Expose default Azurite ports
EXPOSE 10000 10001 10002

# Run Azurite and bind to 0.0.0.0 so it can be accessed from outside the container
CMD ["azurite", "--blobHost", "0.0.0.0", "--queueHost", "0.0.0.0", "--tableHost", "0.0.0.0", "--location", "/data"]
