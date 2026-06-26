---
trigger: always_on
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
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `post-task-hook`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

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

6. **Commit includes loop result in message body:**
   ```
   type(scope): message

   loop: score={{score}} verdict={{verdict}} issues={{issues}}
   ```
   - GATE: Git commit successfully performed with loop stats. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Non-Blocking Rule

The loop NEVER blocks task completion. It informs and archives.

- A score `< 60` is a **WARNING**, not a hard stop.
- Only `HIGH` severity issues with `verdict=FAIL` require addressing before commit.
- If `GROQ_API_KEY` is missing, the script exits `0` silently — never stalls the agent.

## Agent Reference

| Agent | Role | Model |
|---|---|---|
| 1 — Evaluator | Score 0-100 vs project rules | PRIMARY 70B |
| 2 — Critic | List issues + severity | PRIMARY 70B |
| 3 — Mutator | Propose minimal fix mutations | FAST 8B |
| 4 — Validator | Accept/reject mutations | FAST 8B |
| 5 — Archivist | Write to lessons.md / error-patterns.md | PRIMARY 70B |

## Output Files

| File | Content |
|---|---|
| `.agents/sessions/<id_sesion>/loop-log.md` | Human-readable run log |
| `.agents/sessions/<id_sesion>/lessons.md` | LESSON: rules extracted from issues |
| `.agents/sessions/<id_sesion>/error-patterns.md` | HIGH severity issue history |
| `~/.agent-loop/lessons.md` | Global cross-project lessons |