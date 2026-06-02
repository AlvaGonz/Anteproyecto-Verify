---
id: ci-autofix
description: Autofix CI failures using GitHub MCP logs + error-pattern-mining + tdd-workflow + critic gate.
---
# /ci-autofix — CI Failure Auto-Heal Loop

## Pre-conditions
- GitHub MCP must be connected and live.
  - GATE: Test with `github MCP → list_repositories(owner=AlvaGonz)` returns repo list. If FAIL → stop and report. Do NOT proceed.
- `error-pattern-mining` skill loaded.
- `tdd-workflow` skill loaded.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create or update `.agents/docs/PWF/task_plan.md` with the workflow ID `ci-autofix`, current objectives, and the checklist of steps below.
   - GATE: The file `.agents/docs/PWF/task_plan.md` exists and contains all steps. If FAIL → stop and report. Do NOT proceed.

1. **Read CI failure logs via GitHub MCP**.
   - `get_workflow_run_logs(run_id=<id>, repo=AlvaGonz/Proyecto-Estimacion-Soft)`
   - GATE: Logs loaded. Failed job name and step identified. Error message captured. If FAIL → stop and report. Do NOT proceed.

2. **Root cause analysis** via `sequential-thinking` MCP.
   - Structure a reasoning chain: symptom → direct cause → root cause → affected file(s).
   - GATE: Root cause identified with file path and line reference (not just "something failed"). If FAIL → stop and report. Do NOT proceed.

3. **Extract error pattern** via `error-pattern-mining` skill.
   - Send failure description to Groq (llama-3.1-8b-instant).
   - GATE: Valid `PATTERN: ci — ...` line returned and appended to `tasks/error-patterns.md`. If FAIL → stop and report. Do NOT proceed.

4. **Write a failing test** via `tdd-workflow` skill (RED phase).
   - The test must reproduce the exact CI failure locally.
   - GATE: `npx vitest run <test-file>` exits with ≥ 1 FAIL — log output as evidence. If FAIL → stop and report. Do NOT proceed.

5. **Apply minimal fix** (GREEN phase).
   - Change only the file identified in step 2. Do not touch unrelated code.
   - GATE: `npx vitest run <test-file>` exits 0 with 1 PASS. If FAIL → stop and report. Do NOT proceed.

6. **Run full validation suite**.
   - `npm run lint && npx tsc --noEmit && npx vitest run`
   - `cd server && npx vitest run`
   - GATE: All commands exit 0. No new failures introduced. If FAIL → stop and report. Do NOT proceed.

7. **Submit to critic gate**.
   - GATE: Critic scores all axes ≥ 7 and outputs the exact string `CRITIC-APPROVED`. If FAIL → stop and report. Do NOT proceed.

8. **Push fix**.
   - `git add <changed-files> && git commit -m "fix(<domain>): <root-cause-description>" && git push origin <branch>`
   - GATE: New CI run triggered on GitHub. Monitor for green within 10 minutes via GitHub MCP. If FAIL → stop and report. Do NOT proceed.
