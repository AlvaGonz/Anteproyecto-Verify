#!/bin/bash
set -e

SQL_FILE="/usr/config/Build-Database-Sql.sql"
DB_NAME="verifinca-spm-uce-2026"
SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
SQLCMD_OPTS="-S localhost -U sa -P $MSSQL_SA_PASSWORD -C"
FIRST_BOOT_FLAG="/var/opt/mssql/data/.container_initialized"

echo "================================================"
echo "   SQL Server Initialization Startup            "
echo "================================================"

# ── 1. Start SQL Server ──────────────────────────────────────────────────────
/opt/mssql/bin/sqlservr &
SQL_PID=$!

# ── 2. Wait for SQL Server to be ready ──────────────────────────────────────
echo "[Init] Waiting for SQL Server to accept connections..."
for i in $(seq 1 90); do
    if $SQLCMD $SQLCMD_OPTS -Q "SELECT 1" &>/dev/null; then
        echo "[Init] SQL Server is ready (attempt $i)."
        break
    fi
    if [ "$i" -eq 90 ]; then
        echo "[ERROR] SQL Server did not become ready after 90 attempts."
        exit 1
    fi
    sleep 2
done

# Guard: ensure the background SQL Server process is still alive
if ! kill -0 $SQL_PID 2>/dev/null; then
    echo "[ERROR] SQL Server process died unexpectedly."
    exit 1
fi

# ── 3. Determine whether this is a first-boot or a restart ──────────────────
# The flag file lives on the persisted mssql-data volume, so it survives
# container restarts but is absent on a fresh volume.
if [ ! -f "$FIRST_BOOT_FLAG" ]; then
    FIRST_BOOT=true
    echo "[Init] First boot detected — will run SQL initialisation after EF Core."
else
    FIRST_BOOT=false
    echo "[Init] Restarted container — skipping SQL initialisation (schema already exists)."
fi

# Signal to the healthcheck that SQL Server itself is accepting connections
touch /tmp/db_ready
echo "[Init] SQL Server is ready."
echo "================================================"
echo "   Container is Running                         "
echo "================================================"

# ── 4. Background: wait for EF Core migrations, then run seed data ───────────────────
(
    echo "[Seed] Waiting for EF Core to apply migrations to '$DB_NAME'..."
    for j in $(seq 1 120); do
        # Wait until at least 12 migrations have been applied
        MIG_COUNT=$(
            $SQLCMD $SQLCMD_OPTS \
                -d "$DB_NAME" -h -1 \
                -Q "SET NOCOUNT ON;
                    IF OBJECT_ID('[__EFMigrationsHistory]') IS NOT NULL
                        SELECT COUNT(*) FROM [__EFMigrationsHistory]
                    ELSE
                        SELECT 0" \
                2>/dev/null | tr -d ' \r\n'
        )

        # Treat empty/non-numeric result (DB not yet available) as 0
        if ! echo "$MIG_COUNT" | grep -qE '^[0-9]+$'; then
            MIG_COUNT=0
        fi

        if [ "$MIG_COUNT" -ge 12 ]; then
            echo "[Seed] $MIG_COUNT migration(s) detected. Running seed data scripts..."

            # NOTE: The user requested Build-Database-Sql.sql to be run as an SOS fallback
            # to ensure any missing legacy or utility tables (like Provincia, ApiGobernanza) are present.
            echo "[Seed] Running SOS Schema fallback (Build-Database-Sql.sql)..."
            $SQLCMD $SQLCMD_OPTS -d "$DB_NAME" -i "$SQL_FILE" || echo "[Seed] Warning: Build-Database-Sql.sql had errors."

            echo "[Seed] Running seed files..."
            for seed_file in /usr/config/seeds/*.sql; do
                [ -f "$seed_file" ] || continue
                echo "[Seed]  -> $seed_file"
                $SQLCMD $SQLCMD_OPTS -d "$DB_NAME" -i "$seed_file" \
                    || echo "[Seed] Warning: $seed_file completed with errors."
            done

            echo "[Seed] All seeds complete."
            break
        fi

        echo "[Seed] Waiting for migrations... ($MIG_COUNT/12 applied, attempt $j/120)"
        sleep 3
    done

    if [ "$MIG_COUNT" -lt 12 ] 2>/dev/null; then
        echo "[Seed] WARNING: Gave up waiting for EF Core migrations after 6 minutes."
    fi
) &

# ── 5. Keep the container alive ───────────────────────────────────────────────
wait $SQL_PID
