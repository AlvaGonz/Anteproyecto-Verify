---
id: memory-sync
description: Load cross-session memory and surface top risks from previous sessions.
requires_mcps:
  - mcp-context7-mcp
---
# /memory-sync — Cross-Session Memory Load

## Trigger
Run at every session start (automatic). Also invoke manually after a gap of > 24h.

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `memory-sync`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. **Read `.agents/sessions/<id_sesion>/session-memory.md`** — load the last 3 session entries.
   - GATE: File exists and contains ≥ 1 `SESSION:` block. If missing → log `MEMORY-COLD-START` and continue. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. **Surface top 3 risks**: scan all session entries for `- Risk:` lines → pick the 3 most recent non-resolved risks.
   - GATE: Top 3 risks listed in session planning brief. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. **Surface top 3 patterns to avoid**: scan `.agents/sessions/<id_sesion>/error-patterns.md` for the 3 most-recently-appended `PATTERN:` lines.
   - GATE: Patterns loaded and referenced in current session context. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. **Load unresolved lessons**: read `.agents/sessions/<id_sesion>/lessons.md` — identify any `LESSON:` entries not yet acted on.
   - GATE: Unresolved lessons listed (or "ALL RESOLVED" confirmed). If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

5. **Log**: `MEMORY-SYNC: <N> sessions recalled | <M> risks surfaced | <K> patterns loaded`
   - GATE: Log line written to terminal output before proceeding with the task. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Global Sync Step (run after any Groq evolution pass that improves rules/workflows)
After every successful evolution pass (`/evolve-prompts`, `/evolve-skills`, or `rules-evolver` agent):
```bash
cp -r .agent/skills ~/.agent-loop/templates/skills
cp -r .agent/rules ~/.agent-loop/templates/rules
cp -r .agent/workflows ~/.agent-loop/templates/workflows
cp AGENTS.md ~/.agent-loop/templates/AGENTS.md
cp .github/AGENTS.md ~/.agent-loop/templates/.github/AGENTS.md 2>/dev/null || true
```
- GATE: `~/.agent-loop/templates/rules/architecture.md` timestamp is newer than `.agent/rules/architecture.md`. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
- This ensures every future project bootstrapped with `new_project_setup.sh` gets the latest evolved agent rules automatically.
