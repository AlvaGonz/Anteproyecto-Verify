---
name: security-pipeline-ci-hardening
description: Workflow command scaffold for security-pipeline-ci-hardening in Anteproyecto-Verify.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /security-pipeline-ci-hardening

Use this workflow when working on **security-pipeline-ci-hardening** in `Anteproyecto-Verify`.

## Goal

Update and secure CI pipeline configurations, especially for security workflows.

## Common Files

- `.github/workflows/security-pipeline.yml`
- `.github/dependabot.yml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit .github/workflows/security-pipeline.yml to pin or update action versions/hashes
- Optionally add or update .github/dependabot.yml
- Commit changes to ensure CI pipeline is secure and up to date

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.