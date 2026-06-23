try {
    $r = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body '{"email":"see_black@hotmail.com","password":"@Rvl7851819100"}' `
        -ContentType "application/json" `
        -UseBasicParsing `
        -ErrorAction Stop
    Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
    Write-Host "Body: $($r.Content)"
} catch {
    $code = [int]$_.Exception.Response.StatusCode
    Write-Host "Status: $code" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($reader.ReadToEnd())"
}
