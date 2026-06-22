# Test delete flow with existing user see_black@hotmail.com
# Then also verify see_black0@gmail.com works

function Test-DeleteFlow {
    param($Email, $Password, $Label)

    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "Testing: $Label ($Email)" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow

    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

    # Step 1 - Login
    Write-Host "`n[1] Logging in..." -ForegroundColor Cyan
    try {
        $loginBody = "{`"email`":`"$Email`",`"password`":`"$Password`"}"
        $loginResp = Invoke-WebRequest `
            -Uri "http://localhost:5000/api/auth/login" `
            -Method POST `
            -Body $loginBody `
            -ContentType "application/json" `
            -UseBasicParsing `
            -SessionVariable "session" `
            -ErrorAction Stop
        Write-Host "    Login OK: $($loginResp.StatusCode)" -ForegroundColor Green
        $loginData = $loginResp.Content | ConvertFrom-Json
        Write-Host "    User: $($loginData.user.nombre) $($loginData.user.apellido)"
    } catch {
        Write-Host "    Login FAIL: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "    Response: $($reader.ReadToEnd())"
        }
        return
    }

    # Step 2 - Create a test project
    Write-Host "`n[2] Creating test project..." -ForegroundColor Cyan
    try {
        $loginData = ($loginResp.Content | ConvertFrom-Json)
        $userId = $loginData.user.id
        $projBody = "{`"nombre`":`"Test Delete Project`",`"ubicacionTexto`":`"Distrito Nacional`",`"categoria`":0,`"usuarioCreadorId`":`"$userId`"}"
        $projResp = Invoke-WebRequest `
            -Uri "http://localhost:5000/api/projects" `
            -Method POST `
            -Body $projBody `
            -ContentType "application/json" `
            -UseBasicParsing `
            -WebSession $session `
            -ErrorAction Stop
        $projData = $projResp.Content | ConvertFrom-Json
        $projId = $projData.id
        Write-Host "    Created project ID: $projId" -ForegroundColor Green
    } catch {
        Write-Host "    Create project FAIL: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "    Response: $($reader.ReadToEnd())"
        }
        return
    }

    # Step 3 - Delete the project
    Write-Host "`n[3] Deleting project $projId..." -ForegroundColor Cyan
    try {
        $delResp = Invoke-WebRequest `
            -Uri "http://localhost:5000/api/projects/$projId" `
            -Method DELETE `
            -UseBasicParsing `
            -WebSession $session `
            -ErrorAction Stop
        Write-Host "    DELETE Status: $($delResp.StatusCode)" -ForegroundColor Green
        if ($delResp.StatusCode -eq 204) {
            Write-Host "    SUCCESS: Project deleted!" -ForegroundColor Green
        }
    } catch {
        Write-Host "    DELETE FAIL: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "    HTTP Status: $statusCode"
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "    Response: $($reader.ReadToEnd())"
        }
    }

    # Step 4 - Verify it's gone
    Write-Host "`n[4] Verifying project is gone..." -ForegroundColor Cyan
    try {
        $verResp = Invoke-WebRequest `
            -Uri "http://localhost:5000/api/projects/$projId" `
            -Method GET `
            -UseBasicParsing `
            -WebSession $session `
            -ErrorAction Stop
        Write-Host "    Unexpected: project still exists (status $($verResp.StatusCode))" -ForegroundColor Red
    } catch {
        $statusCode = [int]$_.Exception.Response.StatusCode
        if ($statusCode -eq 404) {
            Write-Host "    CONFIRMED: Project 404 - successfully deleted!" -ForegroundColor Green
        } else {
            Write-Host "    Unexpected status: $statusCode" -ForegroundColor Red
        }
    }
}

# Test with existing users
Test-DeleteFlow -Email "see_black@hotmail.com" -Password "@Rvl7851819100" -Label "see_black hotmail"
Test-DeleteFlow -Email "see_black0@gmail.com" -Password "@Rvl7851819100" -Label "see_black0 gmail"

# Check if see_black@gmail.com exists
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Note: 'see_black@gmail.com' is NOT in the database." -ForegroundColor Yellow
Write-Host "Existing accounts:" -ForegroundColor Yellow
Write-Host "  - see_black@hotmail.com" -ForegroundColor White
Write-Host "  - see_black0@gmail.com" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Yellow
