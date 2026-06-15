---
id: restructure-frontend
description: Enforce src/features/<domain>/ structure across the frontend codebase.
requires_mcps:
  - mcp-context7-mcp
  - mcp-StitchMCP
---
# /restructure-frontend — Feature-Based Directory Restructure

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`, `mcp-StitchMCP`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
- Load `.agent/rules/architecture.md`.
  - GATE: `src/features/` directory exists (create it if missing before proceeding). If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `restructure-frontend`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. **Identify all current component files** in `src/components/` that contain domain-specific logic.
   - GATE: List of candidates produced (e.g., components that fetch data or call APIs directly). If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. **Map each component to its target domain** based on AGENTS.md Section 11 LDR coverage table.
   - GATE: Every candidate has a confirmed target domain before any file is moved. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. **Move domain components** to `src/features/<domain>/` one domain at a time.
   - Never move more than one domain per agent run.
   - GATE: After each move — `npm run lint && npx tsc --noEmit` exits 0. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. **Update all import paths** referencing moved files.
   - GATE: `grep -r "from.*components/<moved-component>" src/` returns 0 matches. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

5. **Move domain-specific hooks** to `src/features/<domain>/hooks/`.
   - GATE: No domain hook remains in `src/hooks/` (only shared hooks allowed there). If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

6. **Confirm `src/components/` contains only reusable UI** (no domain logic, no API calls).
   - GATE: `grep -r "fetch\|axios\|useQuery\|useMutation" src/components/` returns 0 matches in non-service files. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

7. **Run full test suite**: `npx vitest run --coverage`
   - GATE: Coverage ≥ 80%. No new test failures introduced. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

8. **Commit**: `refactor(frontend): migrate <domain> to src/features/<domain>/`
   - GATE: Conventional commit format confirmed. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
