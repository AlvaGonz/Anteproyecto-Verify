---
description: Move and enforce server/src/modules/<domain>/ structure across the backend.
requires_mcps:
  - mcp-context7-mcp
  - mcp-mssql
---

# /restructure-backend — Domain-Module Directory Restructure

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`, `mcp-mssql`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
- Load `.agents/rules/architecture.md`.
  - GATE: `server/src/modules/` directory exists. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `restructure-backend`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. **Audit current backend structure**: list all files in `server/src/` that are NOT inside `server/src/modules/`.
   - GATE: Candidates listed by path. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. **Map each file to its target domain module** per AGENTS.md Section 11 LDR coverage table.
   - GATE: Every file has a confirmed target module path before moving. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. **Move files domain by domain** (one domain per agent run): controller → service → routes → validators → model.
   - GATE: After each file move — `cd server && npx tsc --noEmit` exits 0. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. **Update all import paths** in affected files.
   - GATE: `grep -r "from.*\/controllers\|from.*\/services\|from.*\/routes" server/src/modules/` returns 0 matches using old flat paths. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

5. **Verify `server/src/shared/`** contains only truly shared utilities (no domain-specific logic).
   - GATE: `grep -r "from.*modules/" server/src/shared/` returns 0 matches (shared must not import domains). If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

6. **Register updated routes** in `server/src/app.ts` (or main router file).
   - GATE: All domain route files are imported and mounted in the main app. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

7. **Run backend tests**: `cd server && npx vitest run`
   - GATE: Exit 0, no new failures. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

8. **Commit**: `refactor(backend): migrate <domain> to server/src/modules/<domain>/`
   - GATE: Conventional commit format confirmed. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.