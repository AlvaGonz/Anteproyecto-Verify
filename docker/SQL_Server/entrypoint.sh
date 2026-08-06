#!/bin/bash
set -e

DB_NAME="verifinca-spm-uce-2026"
SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
SQLCMD_OPTS="-S localhost -U sa -P $MSSQL_SA_PASSWORD -C"

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

echo "[Init] SQL Server is ready."
echo "================================================"
echo "   Container is Running                         "
echo "================================================"

# Mark the container healthy immediately so the API can start and EF Core
# migrations can create the schema (EF Core is the source of truth).
touch /tmp/db_ready

# ── 3. Background: wait for EF Core schema + C# seed to finish, then run seed data ──
(
    echo "[Seed] Waiting for EF Core migrations and API seeding (ProyectoGuardado populated)..."
    for i in $(seq 1 300); do
        if $SQLCMD $SQLCMD_OPTS -b -d "$DB_NAME" -Q "IF (SELECT COUNT(*) FROM ProyectoGuardado) < 10 THROW 50000, 'not ready', 1" &>/dev/null; then
            echo "[Seed] Schema and API seeding detected (attempt $i)."
            break
        fi
        if [ "$i" -eq 300 ]; then
            echo "[Seed] ERROR: EF Core / API seeding did not complete after 300 attempts."
            exit 1
        fi
        sleep 2
    done

    echo "[Seed] Running seed files..."
    for seed_file in /usr/config/seeds/*.sql; do
        [ -f "$seed_file" ] || continue
        echo "[Seed]  -> $seed_file"
        $SQLCMD $SQLCMD_OPTS -b -d "$DB_NAME" -i "$seed_file" \
            || echo "[Seed] Warning: $seed_file completed with errors."
    done

    echo "[Seed] All seeds complete."
) &

# ── 4. Keep the container alive ───────────────────────────────────────────────
wait $SQL_PID
