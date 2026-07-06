---
id: verify-boundaries
description: Verify frontend/backend/DB layer separation is not violated.
requires_mcps:
  - mcp-context7-mcp
---
# /verify-boundaries — Architecture Boundary Verification

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
- Load `.agent/rules/architecture.md`.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `verify-boundaries`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. **Frontend → Backend boundary**: confirm frontend never imports server-side code.
   - Command: `grep -r "from.*server/" src/`
   - GATE: Exit 0 with 0 matches. Any match is a CRITICAL violation — log file + line. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. **Backend → Frontend boundary**: confirm server never imports frontend files.
   - Command: `grep -rE "from.*['\"]\.\.?/\.\.?/(src|components|features)" server/src/`
   - GATE: 0 matches. Violations flagged immediately. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. **Database access boundary**: confirm Mongoose is only called from module model or service files.
   - Command: `grep -r "\.find\(\|\.findOne\(\|\.save\(\|\.create\(" server/src/ --include="*.ts" | grep -v "modules\|shared/utils"`
   - GATE: 0 matches outside allowed files. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. **Business logic in frontend check**: no stat calculations in React components.
   - Command: `grep -r "mean\|stdDev\|variance\|IQR\|outlier" src/features/ --include="*.tsx"`
   - GATE: 0 matches in component files (only allowed in dedicated util files). If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

5. **API call isolation**: direct `fetch` or `axios` calls only inside `*Service.ts` files.
   - Command: `grep -rn "fetch(" src/ | grep -v "Service.ts\|service.ts"`
   - GATE: 0 matches. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

6. **Output boundary report**: list each check with CLEAN or VIOLATION + file:line.
   - GATE: Report produced even if all checks are CLEAN. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
