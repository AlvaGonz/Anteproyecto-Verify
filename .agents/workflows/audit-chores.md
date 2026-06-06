---
id: audit-chores
description: Perform a comprehensive audit of the codebase structure, dead code, and architecture boundaries.
requires_mcps:
  - mcp-context7-mcp
---
# /audit-chores — Comprehensive Codebase Audit

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
- Load `.agent/rules/architecture.md` before starting.
  - GATE: File exists at `.agent/rules/architecture.md`. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `audit-chores`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. **Map repository layout** using `find_by_name` and `list_dir`.
   - GATE: Output lists all directories under `src/`, `server/src/`, `.agent/`, `.github/workflows/`. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. **Read `package.json` and `server/package.json`** to extract declared dependencies.
   - GATE: Both files loaded. Dependency counts recorded. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. **Detect unused frontend dependencies**: compare imports in `src/` against `package.json`.
   - GATE: List of unused deps produced (or "none found" confirmed). If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. **Detect unused backend dependencies**: compare imports in `server/src/` against `server/package.json`.
   - GATE: List of unused server deps produced. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

5. **Check architecture boundary violations**:
   - `grep -r "from.*server/" src/` → must return 0 matches.
   - `grep -r "from.*src/" server/src/` → must return 0 matches pointing to frontend.
   - GATE: Violations listed by file and line, or "CLEAN" confirmed. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

6. **Identify monolithic files** (>300 lines):
   - GATE: Files >300 lines are listed with line count and flagged for splitting. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

7. **Check LDR domain coverage** (AGENTS.md Section 11): verify every required domain has both frontend feature and backend module directories.
   - GATE: Missing domains listed as `[MISSING]: <domain>`. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

8. **Output `AUDIT.md`** with findings table: domain, status, action required.
   - GATE: File exists at repo root after workflow completes. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
