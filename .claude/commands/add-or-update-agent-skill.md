---
name: add-or-update-agent-skill
description: Workflow command scaffold for add-or-update-agent-skill in Anteproyecto-Verify.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-agent-skill

Use this workflow when working on **add-or-update-agent-skill** in `Anteproyecto-Verify`.

## Goal

Adds a new agent skill or updates an existing one, including documentation, scripts, and references.

## Common Files

- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/scripts/*.mjs`
- `.agents/skills/*/references/*.md`
- `.agents/skills/*/examples.md`
- `.agents/skills/*/templates/*.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update SKILL.md in the appropriate .agents/skills/<skill-name>/ directory.
- Add or update supporting files such as scripts (e.g., scanner.mjs, registry.mjs, test-scanner.mjs) or references (examples.md, findings.md, progress.md, task_plan.md).
- Update or add documentation and templates as needed.
- If relevant, update workflows or integration points.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.