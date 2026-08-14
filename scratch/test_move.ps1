$ErrorActionPreference = 'Stop'

# Check if .agent directory exists
if (Test-Path "C:\Users\Alva\Desktop\Anteproyecto-Verify\.agent") {
    throw ".agent directory still exists!"
}

# Check if ecc-install-state.json has updated paths
$statePath = "C:\Users\Alva\Desktop\Anteproyecto-Verify\.agents\ecc-install-state.json"
if (-not (Test-Path $statePath)) {
    throw "ecc-install-state.json not found in .agents!"
}

$stateContent = Get-Content $statePath -Raw
if ($stateContent -match '"path"\s*:\s*".*?\.agent[\\/]') {
    throw "ecc-install-state.json still contains references to .agent/"
}

# Check if AGENTS.md exists in .agents and doesn't reference .agent/
$agentsMdPath = "C:\Users\Alva\Desktop\Anteproyecto-Verify\.agents\AGENTS.md"
if (Test-Path $agentsMdPath) {
    $mdContent = Get-Content $agentsMdPath -Raw
    if ($mdContent -match '\.agent/') {
        throw "AGENTS.md still references .agent/"
    }
}

# Check if a sample skill was moved successfully
if (-not (Test-Path "C:\Users\Alva\Desktop\Anteproyecto-Verify\.agents\skills\tdd-workflow\SKILL.md")) {
    throw "Sample skill tdd-workflow not found in .agents/skills!"
}

Write-Host "PASS: All tests passed!"
