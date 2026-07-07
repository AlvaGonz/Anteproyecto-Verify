---
id: evolve-skills
description: Automate the evolution of low-fitness agent skills using scoring.
requires_mcps:
  - mcp-context7-mcp
---
# /evolve-skills — LOW-FITNESS Skill Evolution Workflow

## Pre-conditions
## Infrastructure Prerequisites
- Active MCP servers required: `mcp-context7-mcp`
  - GATE: Verify active server connection using scanner. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create the isolated session directory at `.agents/sessions/<id_sesion>/`.
   - Populate `.agents/sessions/<id_sesion>/task_plan.md`, `.agents/sessions/<id_sesion>/findings.md`, and `.agents/sessions/<id_sesion>/progress.md` with the workflow ID `evolve-skills`, current objectives, and the checklist of steps below before touching any project files.
   - GATE: The directory `.agents/sessions/<id_sesion>/` and the base planning files (`task_plan.md`, `findings.md`, `progress.md`) exist and contain all initial steps. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

1. Read `.agents/sessions/<id_sesion>/skill-fitness-log.md`.
   - GATE: Skill fitness log successfully loaded. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

2. List all skills with fitness < 60%.
   - GATE: List of skills with fitness under 60% compiled. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

3. For each LOW-FITNESS skill, activate `skill-fitness` skill.
   - GATE: `skill-fitness` analysis complete for all low-fitness skills. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

4. Apply Groq-proposed `SKILL.md` improvements.
   - GATE: Mutated skill files written successfully. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.

5. Commit: `chore(skills): evolve N skills via fitness scoring`
   - GATE: Commit successful with the correct commit message format. If FAIL → stop and report. Do NOT proceed. MAX_RETRIES: 3.
