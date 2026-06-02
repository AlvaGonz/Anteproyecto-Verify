---
id: restructure-frontend
description: Enforce src/features/<domain>/ structure across the frontend codebase.
---
# /restructure-frontend — Feature-Based Directory Restructure

## Pre-conditions
- Load `.agent/rules/architecture.md`.
  - GATE: `src/features/` directory exists (create it if missing before proceeding). If FAIL → stop and report. Do NOT proceed.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create or update `.agents/docs/PWF/task_plan.md` with the workflow ID `restructure-frontend`, current objectives, and the checklist of steps below.
   - GATE: The file `.agents/docs/PWF/task_plan.md` exists and contains all steps. If FAIL → stop and report. Do NOT proceed.

1. **Identify all current component files** in `src/components/` that contain domain-specific logic.
   - GATE: List of candidates produced (e.g., components that fetch data or call APIs directly). If FAIL → stop and report. Do NOT proceed.

2. **Map each component to its target domain** based on AGENTS.md Section 11 LDR coverage table.
   - GATE: Every candidate has a confirmed target domain before any file is moved. If FAIL → stop and report. Do NOT proceed.

3. **Move domain components** to `src/features/<domain>/` one domain at a time.
   - Never move more than one domain per agent run.
   - GATE: After each move — `npm run lint && npx tsc --noEmit` exits 0. If FAIL → stop and report. Do NOT proceed.

4. **Update all import paths** referencing moved files.
   - GATE: `grep -r "from.*components/<moved-component>" src/` returns 0 matches. If FAIL → stop and report. Do NOT proceed.

5. **Move domain-specific hooks** to `src/features/<domain>/hooks/`.
   - GATE: No domain hook remains in `src/hooks/` (only shared hooks allowed there). If FAIL → stop and report. Do NOT proceed.

6. **Confirm `src/components/` contains only reusable UI** (no domain logic, no API calls).
   - GATE: `grep -r "fetch\|axios\|useQuery\|useMutation" src/components/` returns 0 matches in non-service files. If FAIL → stop and report. Do NOT proceed.

7. **Run full test suite**: `npx vitest run --coverage`
   - GATE: Coverage ≥ 80%. No new test failures introduced. If FAIL → stop and report. Do NOT proceed.

8. **Commit**: `refactor(frontend): migrate <domain> to src/features/<domain>/`
   - GATE: Conventional commit format confirmed. If FAIL → stop and report. Do NOT proceed.
