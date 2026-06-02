---
id: coverage-backlog
description: Generate test specs for low-coverage domains based on coverage gaps.
---
# /coverage-backlog — Coverage Backlog Generation

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create or update `.agents/docs/PWF/task_plan.md` with the workflow ID `coverage-backlog`, current objectives, and the checklist of steps below.
   - GATE: The file `.agents/docs/PWF/task_plan.md` exists and contains all steps. If FAIL → stop and report. Do NOT proceed.

1. Read `tasks/TEST-REPORT.md` coverage gaps.
   - GATE: Gaps successfully identified from the test report. If FAIL → stop and report. Do NOT proceed.

2. Filter: domains with < 20% coverage.
   - GATE: List of domains with coverage under 20% compiled. If FAIL → stop and report. Do NOT proceed.

3. Activate `coverage-evolution` skill for top 5 domains by LDR priority.
   - GATE: `coverage-evolution` skill executed successfully for target domains. If FAIL → stop and report. Do NOT proceed.

4. Write test specs to `tasks/test-backlog.md`.
   - GATE: Specs written to test backlog file correctly. If FAIL → stop and report. Do NOT proceed.

5. Commit: `docs(tests): generate groq test specs for N coverage gaps`
   - GATE: Commit successful with the correct commit message format. If FAIL → stop and report. Do NOT proceed.
