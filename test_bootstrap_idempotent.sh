#!/bin/bash
# Test script to verify SQL Server bootstrap is idempotent
# This test should FAIL initially (RED phase) and PASS after fix (GREEN phase)

set -e

echo "=== Testing SQL Server Bootstrap Idempotency ==="

# Test 1: Fresh container startup should work without errors
echo "Test 1: Fresh container startup..."
docker compose down -v 2>/dev/null || true
docker compose up -d sqlserver

# Wait for healthcheck
echo "Waiting for SQL Server to be healthy..."
for i in {1..60}; do
    if docker compose ps sqlserver | grep -q "healthy"; then
        echo "✓ SQL Server is healthy"
        break
    fi
    sleep 2
done

# Check logs for errors
echo "Checking for bootstrap errors..."
ERRORS=$(docker logs anteproyecto-verify-sqlserver-1 2>&1 | grep -E "(Msg 1801|Msg 2714|Msg 1913|Msg 2627|Msg 2705)" | wc -l)
if [ "$ERRORS" -gt 0 ]; then
    echo "✗ FAIL: Found $ERRORS bootstrap errors in logs"
    docker logs anteproyecto-verify-sqlserver-1 2>&1 | grep -E "(Msg 1801|Msg 2714|Msg 1913|Msg 2627|Msg 2705)"
    exit 1
else
    echo "✓ No bootstrap errors found"
fi

# Test 2: Restart container should also work without errors
echo ""
echo "Test 2: Container restart (simulating restart)..."
docker compose restart sqlserver

echo "Waiting for SQL Server to be healthy after restart..."
for i in {1..60}; do
    if docker compose ps sqlserver | grep -q "healthy"; then
        echo "✓ SQL Server is healthy after restart"
        break
    fi
    sleep 2
done

# Check logs for errors after restart
echo "Checking for bootstrap errors after restart..."
ERRORS=$(docker logs anteproyecto-verify-sqlserver-1 2>&1 | grep -E "(Msg 1801|Msg 2714|Msg 1913|Msg 2627|Msg 2705)" | wc -l)
if [ "$ERRORS" -gt 0 ]; then
    echo "✗ FAIL: Found $ERRORS bootstrap errors after restart"
    docker logs anteproyecto-verify-sqlserver-1 2>&1 | grep -E "(Msg 1801|Msg 2714|Msg 1913|Msg 2627|Msg 2705)"
    exit 1
else
    echo "✓ No bootstrap errors after restart"
fi

echo ""
echo "=== All bootstrap idempotency tests PASSED ==="
exit 0