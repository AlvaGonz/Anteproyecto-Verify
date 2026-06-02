---
id: error-digest
description: Summarize error patterns to surface top recurring root causes.
---
# /error-digest — Error Digest Generation

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create or update `.agents/docs/PWF/task_plan.md` with the workflow ID `error-digest`, current objectives, and the checklist of steps below.
   - GATE: The file `.agents/docs/PWF/task_plan.md` exists and contains all steps. If FAIL → stop and report. Do NOT proceed.

1. Read `tasks/error-patterns.md`.
   - GATE: Error patterns successfully loaded. If FAIL → stop and report. Do NOT proceed.

2. Send to Groq: "Summarize these error patterns. Surface the top 3 recurring root causes and their recommended fix strategies."
   - GATE: Summary generated with top 3 root causes and strategies. If FAIL → stop and report. Do NOT proceed.

3. Output digest to `tasks/error-digest.md`.
   - GATE: Digest written to `tasks/error-digest.md` correctly. If FAIL → stop and report. Do NOT proceed.

4. Surface in next planning brief.
   - GATE: Digest presented in the next planning brief. If FAIL → stop and report. Do NOT proceed.
