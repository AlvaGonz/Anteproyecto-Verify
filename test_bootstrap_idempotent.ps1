# Test SQL Server Bootstrap Idempotency
Write-Host "=== Testing SQL Server Bootstrap Idempotency ===" -ForegroundColor Cyan

# Test 1: Check current logs for bootstrap errors
Write-Host "`nTest 1: Checking current container logs for bootstrap errors..." -ForegroundColor Yellow
$logs = docker logs anteproyecto-verify-sqlserver-1 2>&1
$errors = $logs | Select-String -Pattern "(Msg 1801|Msg 2714|Msg 1913|Msg 2627|Msg 2705)"
if ($errors) {
    Write-Host "FAIL: Found bootstrap errors in current logs:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "PASS: No bootstrap errors in current logs" -ForegroundColor Green
}

# Test 2: Restart container and check for errors
Write-Host "`nTest 2: Restarting SQL Server container..." -ForegroundColor Yellow
docker compose restart sqlserver

Write-Host "Waiting for SQL Server to be healthy after restart..." -ForegroundColor Yellow
$healthy = $false
for ($i = 1; $i -le 60; $i++) {
    $status = docker compose ps sqlserver --format json | ConvertFrom-Json
    if ($status.Health -eq "healthy") {
        $healthy = $true
        Write-Host "PASS: SQL Server is healthy after restart" -ForegroundColor Green
        break
    }
    Start-Sleep 2
}

if (-not $healthy) {
    Write-Host "FAIL: SQL Server did not become healthy within timeout" -ForegroundColor Red
    exit 1
}

# Check logs after restart
Write-Host "Checking for bootstrap errors after restart..." -ForegroundColor Yellow
Start-Sleep 5  # Give time for seed script to run
$logs = docker logs anteproyecto-verify-sqlserver-1 2>&1
$errors = $logs | Select-String -Pattern "(Msg 1801|Msg 2714|Msg 1913|Msg 2627|Msg 2705)"
if ($errors) {
    Write-Host "FAIL: Found $($errors.Count) bootstrap errors after restart:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "PASS: No bootstrap errors after restart" -ForegroundColor Green
}

Write-Host "`n=== All bootstrap idempotency tests PASSED ===" -ForegroundColor Cyan
exit 0