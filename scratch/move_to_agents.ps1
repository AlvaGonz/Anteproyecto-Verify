$ErrorActionPreference = 'Stop'

$src = "C:\Users\Alva\Desktop\Anteproyecto-Verify\.agent"
$dest = "C:\Users\Alva\Desktop\Anteproyecto-Verify\.agents"

if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest | Out-Null
}

# 1. Merge the directories
$items = Get-ChildItem -Path $src
foreach ($item in $items) {
    if ($item.PSIsContainer) {
        # Copy directory contents
        $destDir = Join-Path $dest $item.Name
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir | Out-Null
        }
        Copy-Item -Path "$($item.FullName)\*" -Destination $destDir -Recurse -Force
    } else {
        # It's a file in root
        $destFile = Join-Path $dest $item.Name
        Copy-Item -Path $item.FullName -Destination $destFile -Force
    }
}

# 2. Fix the ecc-install-state.json file
$statePath = Join-Path $dest "ecc-install-state.json"
if (Test-Path $statePath) {
    $content = Get-Content $statePath -Raw
    # Update paths in JSON
    $content = $content -replace '"path"\s*:\s*"\.agent/', '"path": ".agents/'
    $content = $content -replace '"path"\s*:\s*"\.agent\\\\', '"path": ".agents\\'
    
    # Also replace any AGENTS.md references if they exist
    $content = $content -replace '\.agent/AGENTS\.md', '.agents/AGENTS.md'
    $content = $content -replace '\.agent\\\\AGENTS\.md', '.agents\\AGENTS.md'
    
    Set-Content -Path $statePath -Value $content
}

# 3. Update AGENTS.md references to .agent if any
$agentsMd = Join-Path $dest "AGENTS.md"
if (Test-Path $agentsMd) {
    $mdContent = Get-Content $agentsMd -Raw
    $mdContent = $mdContent -replace '\.agent/', '.agents/'
    Set-Content -Path $agentsMd -Value $mdContent
}

# 4. Remove original .agent directory
Remove-Item -Path $src -Recurse -Force

Write-Host "Migration complete."
