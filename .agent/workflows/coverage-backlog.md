---
id: coverage-backlog
description: Generate test specs for low-coverage domains based on coverage gaps.
requires_mcps:
  - mcp-context7-mcp
---
# /coverage-backlog — Coverage Backlog Generation

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `coverage-backlog`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. Read `.agents/sessions/<id_sesion>/TEST-REPORT.md` coverage gaps.
   - GATE: Gaps successfully identified from the test report. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. Filter: domains with < 20% coverage.
   - GATE: List of domains with coverage under 20% compiled. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. Activate `coverage-evolution` skill for top 5 domains by LDR priority.
   - GATE: `coverage-evolution` skill executed successfully for target domains. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. Write test specs to `.agents/sessions/<id_sesion>/test-backlog.md`.
   - GATE: Specs written to test backlog file correctly. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

5. Commit: `docs(tests): generate groq test specs for N coverage gaps`
   - GATE: Commit successful with the correct commit message format. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
