---
id: evolve-skills
description: Automate the evolution of low-fitness agent skills using scoring.
---
# /evolve-skills — LOW-FITNESS Skill Evolution Workflow

## Steps

0. **Initialize Planning Files** (@planning-with-files)
   - Create or update `.agents/docs/PWF/task_plan.md` with the workflow ID `evolve-skills`, current objectives, and the checklist of steps below.
   - GATE: The file `.agents/docs/PWF/task_plan.md` exists and contains all steps. If FAIL → stop and report. Do NOT proceed.

1. Read `tasks/skill-fitness-log.md`.
   - GATE: Skill fitness log successfully loaded. If FAIL → stop and report. Do NOT proceed.

2. List all skills with fitness < 60%.
   - GATE: List of skills with fitness under 60% compiled. If FAIL → stop and report. Do NOT proceed.

3. For each LOW-FITNESS skill, activate `skill-fitness` skill.
   - GATE: `skill-fitness` analysis complete for all low-fitness skills. If FAIL → stop and report. Do NOT proceed.

4. Apply Groq-proposed `SKILL.md` improvements.
   - GATE: Mutated skill files written successfully. If FAIL → stop and report. Do NOT proceed.

5. Commit: `chore(skills): evolve N skills via fitness scoring`
   - GATE: Commit successful with the correct commit message format. If FAIL → stop and report. Do NOT proceed.
