---
name: update-workflow-definition-and-documentation
description: Workflow command scaffold for update-workflow-definition-and-documentation in Anteproyecto-Verify.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-workflow-definition-and-documentation

Use this workflow when working on **update-workflow-definition-and-documentation** in `Anteproyecto-Verify`.

## Goal

Update or add new agent workflows, keeping workflow definitions, documentation, and lock files in sync.

## Common Files

- `.agents/workflows/*.md`
- `.agents/skills/antigravity-workflows/data/workflows.json`
- `.agents/skills/antigravity-workflows/docs/WORKFLOWS.md`
- `skills-lock.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit or add workflow markdown file(s) in .agents/workflows/
- Update workflows.json in .agents/skills/antigravity-workflows/data/
- Update or create documentation in .agents/skills/antigravity-workflows/docs/WORKFLOWS.md
- Update skills-lock.json if necessary

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.