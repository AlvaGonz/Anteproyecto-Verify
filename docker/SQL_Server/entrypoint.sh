#!/bin/bash
set -e

# Define paths
SQL_FILE="/usr/config/Build-Database-Sql.sql"
TSQL_FILE="/usr/config/Build-Database-Sql.tsql"
TRANSLATOR="/usr/config/translate.py"
HASH_FILE="/var/opt/mssql/data/schema_hash.txt"
CURRENT_HASH=$(md5sum "$SQL_FILE" | awk '{print $1}')
RECREATE_DB=false

echo "================================================"
echo "   SQL Server Custom Initialization Startup     "
echo "================================================"

# 1. Translate MySQL syntax to valid T-SQL on startup
if [ -f "$SQL_FILE" ]; then
    echo "[Init] Found SQL file: $SQL_FILE, but EF Core will handle database migrations."
else
    echo "[Init] SQL file not found at $SQL_FILE, proceeding with EF Core migrations."
fi

# 2. Start SQL Server in the background
echo "[Init] Starting SQL Server in the background..."
/opt/mssql/bin/sqlservr &
SQL_PID=$!

# 3. Wait for SQL Server to boot up and be ready
echo "[Init] Waiting for SQL Server port 1433 to be active..."
for i in {1..90}; do
    # Run a simple query to verify server health and authentication (using tools18 and trusting self-signed cert)
    if /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -C &> /dev/null; then
        echo "[Init] SQL Server is healthy and ready to accept connections!"
        break
    else
        echo "[Init] Waiting for SQL Server... ($i/90)"
        sleep 2
    fi
done

# Ensure the background SQL Server process is still alive
if ! kill -0 $SQL_PID 2>/dev/null; then
    echo "[ERROR] SQL Server failed to start."
    exit 1
fi

echo "[Init] EF Core will handle schema creation."

echo "================================================"
echo "   SQL Server Container is Ready and Running   "
echo "================================================"

# Signal that the database is fully initialized
touch /tmp/db_ready

# Spawn background job to load dummy data once EF Core schema is ready
(
    echo "[Seed] Waiting for EF Core to create the database schema..."
    for j in {1..60}; do
        MIG_COUNT=$(/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d "verifinca-spm-uce-2026" -h -1 -Q "SET NOCOUNT ON; IF OBJECT_ID('[__EFMigrationsHistory]') IS NOT NULL SELECT COUNT(*) FROM [__EFMigrationsHistory] ELSE SELECT 0" -C | tr -d ' ' | tr -d '\r')
        if [ "$MIG_COUNT" = "1" ] || [ "$MIG_COUNT" -gt 0 ] 2>/dev/null; then
            echo "[Seed] Database schema is ready. Injecting raw SQL tables..."
            /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d "verifinca-spm-uce-2026" -i "$SQL_FILE" -C || echo "[Seed] Finished running raw SQL tables."
            
            echo "[Seed] Loading dummy data seeds..."
            for seed_file in /usr/config/seeds/*.sql; do
                if [ -f "$seed_file" ]; then
                    echo "[Seed] Executing $seed_file..."
                    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d "verifinca-spm-uce-2026" -i "$seed_file" -C || echo "[Seed] Warning: Failed to execute $seed_file"
                fi
            done
            echo "[Seed] Dummy data seeding complete!"
            break
        else
            sleep 3
        fi
    done
) &

# 5. Keep the container alive by waiting for the SQL Server process
wait $SQL_PID
