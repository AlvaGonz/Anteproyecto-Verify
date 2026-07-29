$ErrorActionPreference = "Stop"

$workflowsDir = Join-Path $PSScriptRoot "..\workflows"
$archiveDir = Join-Path $workflowsDir "archive"

if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir | Out-Null
}

# The list of approved workflows for VeriFinca
$approvedWorkflows = @(
    "code-review.md", "build-fix.md", "ci-autofix.md", "debug-session.md",
    "react-test.md", "react-review.md", "quality-gate.md", "post-task-hook.md",
    "security-scan.md", "security-audit-cicd.md", "refactor-clean.md",
    "restructure-backend.md", "restructure-frontend.md", "update-docs.md",
    "verify-boundaries.md", "new-feature.md", "cleanup-dead-code.md"
)

Get-ChildItem -Path $workflowsDir -File | Where-Object { 
    $approvedWorkflows -notcontains $_.Name 
} | ForEach-Object {
    Write-Host "Archiving workflow: $($_.Name)"
    Move-Item -Path $_.FullName -Destination $archiveDir -Force
}

Write-Host "Archiving complete. See $archiveDir for archived workflows."
