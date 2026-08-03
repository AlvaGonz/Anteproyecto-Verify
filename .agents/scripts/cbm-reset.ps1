<#
.SYNOPSIS
    Reset the codebase-memory-mcp index for a project on Windows.
.DESCRIPTION
    Workaround for upstream bug DeusData/codebase-memory-mcp #277 / #914
    (https://github.com/DeusData/codebase-memory-mcp/issues/914):
    orphan codebase-memory-mcp.exe processes hold SQLite handles on
    .db/.db-wal/.db-shm WITHOUT FILE_SHARE_DELETE, so delete_project fails
    with "Permission denied" (ERROR_SHARING_VIOLATION). Admin rights do NOT
    help - the handle must be released first.

    This script: kills all cbm processes -> waits for handle release ->
    deletes the project's DB files -> re-indexes via CLI one-shot mode.
.PARAMETER RepoPath
    Absolute path of the repository to reset (default: current directory).
.PARAMETER ListOnly
    Show processes / DB files without modifying anything.
.PARAMETER KeepMcpRunning
    Do NOT kill the codebase-memory-mcp process tree (only delete stale DBs).
    Not recommended - the server re-opens the DB on the next call.
.EXAMPLE
    .\cbm-reset.ps1 -RepoPath C:\Users\Alva\Desktop\Anteproyecto-Verify
.EXAMPLE
    .\cbm-reset.ps1 -ListOnly
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$RepoPath = (Get-Location).Path,
    [switch]$ListOnly,
    [switch]$KeepMcpRunning
)

$ErrorActionPreference = 'Stop'
$cbm = 'codebase-memory-mcp'

function Get-ProjectSlug([string]$path) {
    $slug = ($path -replace '[\\/]+', '-') -replace '^-', '' -replace '-$', ''
    $slug = $slug -replace ':', ''
    return $slug
}

$projectName = Get-ProjectSlug $RepoPath
$cacheDir    = Join-Path $env:USERPROFILE '.cache\codebase-memory-mcp'
$dbFiles     = Get-ChildItem $cacheDir -Filter "$projectName.db*" -ErrorAction SilentlyContinue

if ($ListOnly) {
    Write-Host "Project slug: $projectName"
    if (-not $dbFiles) {
        Write-Host "No DB files for $projectName in $cacheDir"
    } else {
        $dbFiles | ForEach-Object {
            Write-Host ("  - {0}  ({1} KB, mod {2})" -f $_.Name, [int]($_.Length / 1KB), $_.LastWriteTime)
        }
    }
    $procs = Get-Process -Name 'codebase-memory-mcp*' -ErrorAction SilentlyContinue
    Write-Host ("Live cbm processes: {0}" -f @($procs).Count)
    $procs | Select-Object Id, StartTime | Format-Table -AutoSize
    return
}

if ($dbFiles) {
    if (-not $KeepMcpRunning) {
        Write-Host "Killing codebase-memory-mcp processes (releases SQLite locks)..."
        Get-Process -Name 'codebase-memory-mcp*' -ErrorAction SilentlyContinue |
            Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    $dbFiles | ForEach-Object {
        Write-Host "Deleting $($_.FullName)"
        Remove-Item -LiteralPath $_.FullName -Force
    }
} else {
    Write-Host "No DB files for $projectName - nothing to delete."
}

Write-Host "Reindexing $RepoPath ..."
& $cbm cli index_repository --repo-path ($RepoPath -replace '\\', '/') 2>&1 | Out-String | Write-Host
if ($LASTEXITCODE -ne 0) {
    throw "Reindex failed with exit code $LASTEXITCODE"
}

Write-Host ""
Write-Host "Done. If a client (opencode / Claude Code) is running, restart it so it spawns a fresh MCP server."
Write-Host "Prevent recurrence: set auto_watch=false (codebase-memory-mcp config set auto_watch false)"
