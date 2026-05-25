FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

# Install Python 3 for dynamic MySQL-to-TSQL translation
RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*

# Create config directory
RUN mkdir -p /usr/config

# Copy initialization files
COPY docker/SQL_Server/translate.py /usr/config/translate.py
COPY docker/SQL_Server/entrypoint.sh /usr/config/entrypoint.sh
# Copy original SQL file from workspace root as fallback for build-time self-containment
COPY Build-Database-Sql.sql /usr/config/Build-Database-Sql.sql

# Set correct permissions
RUN chmod +x /usr/config/entrypoint.sh && \
    chown -R mssql:root /usr/config

# Expose SQL Server port
EXPOSE 1433

# Switch back to the non-root mssql user for security
USER mssql

# Set entrypoint to run the custom initialization script
ENTRYPOINT ["/usr/config/entrypoint.sh"]
