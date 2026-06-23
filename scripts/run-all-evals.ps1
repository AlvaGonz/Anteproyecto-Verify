Set-Location "C:\Users\Admin\Desktop\Anteproyecto-Verify"
$env:Path += ";C:\Users\Admin\AppData\Local\Microsoft\Waza;C:\Users\Admin\AppData\Local\Microsoft\WinGet\Packages\GitHub.Copilot_Microsoft.Winget.Source_8wekyb3d8bbwe"
$waza = "C:\Users\Admin\AppData\Local\Microsoft\Waza\waza.exe"

$resultsDir = "results/eval-run-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null

$evals = Get-ChildItem "evals" -Directory | Where-Object { Test-Path "evals/$_/eval.yaml" } | Select-Object -ExpandProperty Name

$summary = @()
$total = $evals.Count
$i = 0

foreach ($eval in $evals) {
    $i++
    Write-Output "[$i/$total] Running $eval..."
    $outFile = "$resultsDir/$eval.json"
    $start = Get-Date
    $output = & $waza run "evals/$eval/eval.yaml" --output $outFile 2>&1
    $dur = (Get-Date) - $start
    
    # Extract key metrics
    $score = if ($output -match 'Aggregate Score:\s+([\d.]+)') { $matches[1] } else { 'N/A' }
    $success = if ($output -match 'Success Rate:\s+([\d.]+%)') { $matches[1] } else { 'N/A' }
    $tokens = if ($output -match 'Total Tokens.*?([\d,]+)') { $matches[1] } else { 'N/A' }
    
    Write-Output "  Score: $score | Success: $success | Duration: $($dur.TotalSeconds.ToString('F0'))s | Tokens: $tokens"
    $summary += [PSCustomObject]@{ Skill = $eval; Score = $score; Success = $success; Duration = "$($dur.TotalSeconds.ToString('F0'))s"; Tokens = $tokens }
}

$summary | Export-Csv "$resultsDir/summary.csv" -NoTypeInformation
Write-Output "=== DONE ==="
Write-Output "Results saved to $resultsDir"
$summary | Format-Table -AutoSize
