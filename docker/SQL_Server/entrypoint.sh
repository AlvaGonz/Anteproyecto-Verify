#!/bin/bash
set -e

# Define paths
SQL_FILE="/usr/config/Build-Database-Sql.sql"
TSQL_FILE="/usr/config/Build-Database-Sql.tsql"
TRANSLATOR="/usr/config/translate.py"

echo "================================================"
echo "   SQL Server Custom Initialization Startup     "
echo "================================================"

# 1. Translate MySQL syntax to valid T-SQL on startup
if [ -f "$SQL_FILE" ]; then
    echo "[Init] Found SQL file: $SQL_FILE"
    echo "[Init] Running translation to T-SQL..."
    python3 "$TRANSLATOR" "$SQL_FILE" "$TSQL_FILE"
    echo "[Init] Translation finished successfully."
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
    # Run a simple query to verify server health and authentication
    if /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" &> /dev/null; then
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
echo "[Init] Executing translated T-SQL script to build database..."
if /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i "$TSQL_FILE"; then
    echo "[Init] SQL script executed successfully!"
else
    echo "[WARNING] SQL script execution reported some issues (e.g. objects already existing, which is expected on persistent runs)."
fi

echo "================================================"
echo "   SQL Server Container is Ready and Running   "
echo "================================================"

# 5. Keep the container alive by waiting for the SQL Server process
wait $SQL_PID
