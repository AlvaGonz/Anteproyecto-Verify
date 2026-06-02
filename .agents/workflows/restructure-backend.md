---
id: restructure-backend
description: Move and enforce server/src/modules/<domain>/ structure across the backend.
---
# /restructure-backend — Domain-Module Directory Restructure

## Pre-conditions
- Load `.agent/rules/architecture.md`.
  - GATE: `server/src/modules/` directory exists. If FAIL → stop and report. Do NOT proceed.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create or update `.agents/docs/PWF/task_plan.md` with the workflow ID `restructure-backend`, current objectives, and the checklist of steps below.
   - GATE: The file `.agents/docs/PWF/task_plan.md` exists and contains all steps. If FAIL → stop and report. Do NOT proceed.

1. **Audit current backend structure**: list all files in `server/src/` that are NOT inside `server/src/modules/`.
   - GATE: Candidates listed by path. If FAIL → stop and report. Do NOT proceed.

2. **Map each file to its target domain module** per AGENTS.md Section 11 LDR coverage table.
   - GATE: Every file has a confirmed target module path before moving. If FAIL → stop and report. Do NOT proceed.

3. **Move files domain by domain** (one domain per agent run): controller → service → routes → validators → model.
   - GATE: After each file move — `cd server && npx tsc --noEmit` exits 0. If FAIL → stop and report. Do NOT proceed.

4. **Update all import paths** in affected files.
   - GATE: `grep -r "from.*\/controllers\|from.*\/services\|from.*\/routes" server/src/modules/` returns 0 matches using old flat paths. If FAIL → stop and report. Do NOT proceed.

5. **Verify `server/src/shared/`** contains only truly shared utilities (no domain-specific logic).
   - GATE: `grep -r "from.*modules/" server/src/shared/` returns 0 matches (shared must not import domains). If FAIL → stop and report. Do NOT proceed.

6. **Register updated routes** in `server/src/app.ts` (or main router file).
   - GATE: All domain route files are imported and mounted in the main app. If FAIL → stop and report. Do NOT proceed.

7. **Run backend tests**: `cd server && npx vitest run`
   - GATE: Exit 0, no new failures. If FAIL → stop and report. Do NOT proceed.

8. **Commit**: `refactor(backend): migrate <domain> to server/src/modules/<domain>/`
   - GATE: Conventional commit format confirmed. If FAIL → stop and report. Do NOT proceed.
