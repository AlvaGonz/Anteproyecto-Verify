---
id: post-task-hook
description: Runs automatically after every completed agent task to evaluate quality.
requires_mcps:
  - mcp-context7-mcp
  - mcp-github-mcp-server
---

# Workflow: post-task-hook

## Trigger
Runs AUTOMATICALLY after EVERY completed agent task — no exceptions.

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`, `mcp-github-mcp-server`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate with workflow ID `post-task-hook`, objectives, and checklist.
   - GATE: Directory and base planning files exist. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. **Collect:** What was the task? What files were changed?
   - GATE: Changed files and task description gathered. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. **Run:**
   ```bash
   python scripts/post_task_loop.py \
     --task "{{TASK_DESCRIPTION}}" \
     --output "{{FILES_CHANGED_AND_WHAT_WAS_DONE}}"
   ```
   - GATE: Script executes and returns JSON/stdout. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. **Read stdout JSON result.**
   - GATE: JSON parsed. Score, verdict, and high issues extracted. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. If `high_issues > 0`: Read `.agents/sessions/<id_sesion>/loop-log.md`, address HIGH issues before committing.
   - GATE: Any HIGH issues addressed. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

5. If `verdict == PASS` or `high_issues == 0`: Proceed to commit.
   - GATE: Ready for commit. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
