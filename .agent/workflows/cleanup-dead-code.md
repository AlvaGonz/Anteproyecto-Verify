---
id: cleanup-dead-code
description: Remove unused files, unreachable code, and stale artifacts from the repo.
requires_mcps:
  - mcp-context7-mcp
---
# /cleanup-dead-code — Dead Code Elimination

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
- Run `/audit-chores` first if `AUDIT.md` is older than 24h.
  - GATE: `AUDIT.md` exists before starting. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `cleanup-dead-code`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. **Identify stale root-level files**: scan repo root for files that are not `package.json`, `vite.config.ts`, `tsconfig.json`, `AGENTS.md`, `docker-compose.yml`, `README.md`, `.env.example`.
   - GATE: List of candidates produced. Each confirmed stale before deletion. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. **Find unreachable exports**: check for named exports in `src/` and `server/src/` never imported anywhere.
   - GATE: List produced with file path and export name. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. **Remove confirmed dead files**: delete only files confirmed unused in step 1 and 2.
   - GATE: `git status` shows only expected deletions — no accidental source file removals. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. **Remove stale artifacts**: delete `.antigravity/`, `flatten-skills.ps1`, `test-evolution.mjs` and similar one-off scripts from repo root.
   - GATE: `git status` diff matches expected list. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

5. **Prune empty directories** after deletions.
   - GATE: No empty `__tests__/` or feature directories remain. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

6. **Run lint + typecheck after cleanup** to confirm no import breakage.
   - `npm run lint && npx tsc --noEmit`
   - GATE: Both exit 0. Any error means a required file was accidentally removed — revert immediately. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

7. **Commit**: `chore(cleanup): remove dead code and stale artifacts`
   - GATE: Commit message follows conventional format. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
