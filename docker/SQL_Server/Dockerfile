FROM mcr.microsoft.com/mssql/server:2022-latest

# nosemgrep
USER root

# Install python3 in a single layer and clean up apt cache immediately
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 && \
    rm -rf /var/lib/apt/lists/*

# Create config directory
RUN mkdir -p /usr/config

COPY docker/SQL_Server/translate.py   /usr/config/translate.py
COPY docker/SQL_Server/entrypoint.sh  /usr/config/entrypoint.sh
COPY Build-Database-Sql.sql           /usr/config/Build-Database-Sql.sql

# Strip Windows carriage returns, set permissions in one RUN layer
RUN sed -i -e 's/\r$//' /usr/config/entrypoint.sh && \
    chmod +x /usr/config/entrypoint.sh && \
    chown -R mssql:root /usr/config

# Expose SQL Server port
EXPOSE 1433

# Switch back to the non-root mssql user for security
USER mssql

# Set entrypoint to run the custom initialization script
ENTRYPOINT ["/usr/config/entrypoint.sh"]
