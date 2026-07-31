$ErrorActionPreference = "Stop"

$skillsDir = Join-Path $PSScriptRoot "..\skills"
$archiveDir = Join-Path $skillsDir "archive"

if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir | Out-Null
}

# The list of approved skills from SKILL_SELECTION.md
$approvedSkills = @(
    "test-driven-development", "clean-architecture", "workflow-patterns",
    "react-patterns", "react-best-practices", "typescript-pro", "stitch-ui-design",
    "dotnet-best-practices", "dotnet-design-pattern-review", "api-design-principles",
    "sql-optimization-patterns", "owasp-security", "secrets-management",
    "vulnerability-scanner", "security-review", "e2e-testing", "playwright",
    "playwright-cli", "quality-qa", "wcag-audit-patterns", "ui-visual-validator",
    "github"
)

Get-ChildItem -Path $skillsDir -Directory | Where-Object { 
    $_.Name -ne "archive" -and $approvedSkills -notcontains $_.Name 
} | ForEach-Object {
    Write-Host "Archiving skill: $($_.Name)"
    Move-Item -Path $_.FullName -Destination $archiveDir -Force
}

Write-Host "Archiving complete. See $archiveDir for archived skills."
