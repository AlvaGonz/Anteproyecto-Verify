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
    echo "[Init] Found SQL file: $SQL_FILE"
    echo "[Init] Running translation to T-SQL..."
    python3 "$TRANSLATOR" "$SQL_FILE" "$TSQL_FILE"
    echo "[Init] Translation finished successfully."
    
    # Detect schema changes
    if [ -f "$HASH_FILE" ]; then
        SAVED_HASH=$(cat "$HASH_FILE")
        echo "[Init] Saved schema hash: $SAVED_HASH"
        echo "[Init] Current schema hash: $CURRENT_HASH"
        if [ "$SAVED_HASH" != "$CURRENT_HASH" ]; then
            echo "[Init] Schema changes detected! Will drop and recreate the database."
            RECREATE_DB=true
        else
            echo "[Init] No schema changes detected. Keeping existing database."
        fi
    else
        echo "[Init] No schema hash found. This is a fresh initialization."
        RECREATE_DB=true
    fi
else
    echo "[ERROR] SQL file not found at $SQL_FILE!"
    exit 1
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

# 4. Execute the translated T-SQL script
if [ "$RECREATE_DB" = "true" ]; then
    echo "[Init] Recreating database because changes were detected or it is a fresh install..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "IF EXISTS (SELECT * FROM sys.databases WHERE name = 'verifinca-spm-uce-2026') BEGIN ALTER DATABASE [verifinca-spm-uce-2026] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [verifinca-spm-uce-2026]; END" -C
fi

echo "[Init] Executing translated T-SQL script to build database..."
if /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i "$TSQL_FILE" -C; then
    echo "[Init] SQL script executed successfully!"
    # Save the new hash after successful execution
    echo "$CURRENT_HASH" > "$HASH_FILE"
    echo "[Init] Schema hash saved successfully: $CURRENT_HASH"
else
    echo "[WARNING] SQL script execution reported some issues (e.g. objects already existing, which is expected on persistent runs)."
fi

echo "================================================"
echo "   SQL Server Container is Ready and Running   "
echo "================================================"

# Signal that the database is fully initialized
touch /tmp/db_ready

# 5. Keep the container alive by waiting for the SQL Server process
wait $SQL_PID
