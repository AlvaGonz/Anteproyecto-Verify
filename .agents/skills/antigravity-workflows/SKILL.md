---
name: antigravity-workflows
description: "Orchestrate multiple Antigravity skills through guided workflows for SaaS MVP delivery, security audits, AI agent builds, and browser QA."
risk: none
source: self
date_added: "2026-02-27"
---

# Antigravity Workflows

Use this skill to turn a complex objective into a guided sequence of skill invocations.

## When to Use This Skill

Use this skill when:
- The user wants to combine several skills without manually selecting each one.
- The goal is multi-phase (for example: plan, build, test, ship).
- The user asks for best-practice execution for common scenarios like:
  - Shipping a SaaS MVP
  - Running a web security audit
  - Building an AI agent system
  - Implementing browser automation and E2E QA

## Workflow Source of Truth

Read workflows in this order:
1. `docs/WORKFLOWS.md` for human-readable playbooks.
2. `data/workflows.json` for machine-readable workflow metadata.

## How to Run This Skill

1. Identify the user's concrete outcome.
2. Propose the 1-2 best matching workflows.
3. Ask the user to choose one.
4. Execute step-by-step:
   - Announce current step and expected artifact.
   - Invoke recommended skills for that step.
   - Verify completion criteria before moving to next step.
5. At the end, provide:
   - Completed artifacts
   - Validation evidence
   - Remaining risks and next actions

## Dynamic Generation Protocol

If the user's task or objective does not match any existing workflow in `data/workflows.json`, you must activate the **Dynamic Workflow Generation Engine** in this skill to synthesize a new custom workflow:

1. **Attempt Match First**:
   - Check if any workflow in `data/workflows.json` matches the user's task or objective. If yes, use that.
2. **If No Match, Synthesize a New Workflow**:
   a. **Discover Available Skills**:
      - Run the skill scanner: `node c:/Users/Admin/Desktop/Anteproyecto-Verify/.agents/skills/antigravity-skill-orchestrator/scripts/scanner.mjs` (or use the global path fallback if running outside the workspace).
      - This scanner outputs all verified local and global skills currently installed.
   b. **Decompose the Objective**:
      - Break the user's high-level objective into a logical sequence of phases (e.g., Phase 1: Planning, Phase 2: Design, Phase 3: Building, Phase 4: Verification).
   c. **Select and Validate Skills**:
      - For each phase, assign the most appropriate skill discovered from the scanner's output.
      - **CRITICAL**: Every skill referenced in a dynamically generated workflow MUST exist in the output of `scanner.mjs`. If a phase needs a skill that does not exist, replace it with the closest available skill or mark the phase as `MANUAL` (requiring human intervention). **Never hallucinate or reference non-existent skills.**
   d. **Incorporate Planning-with-Files & Gates**:
      - **Mandatory Step 0**: Every dynamically generated workflow MUST start with `Step 0: Initialize Planning Files (@planning-with-files)` to create and populate `.agents/docs/PWF/task_plan.md` before any work begins.
      - **Validation Gates**: Every phase transition MUST have a formal validation gate (`GATE: [condition]. If FAIL → stop and report. Do NOT proceed.`).
   e. **Materialize the Workflow**:
      - Generate a slug/id for the workflow (e.g., `compliance-dashboard-pipeline`).
      - Write the newly synthesized workflow file to `.agents/workflows/<id>.md`.
      - Append the new workflow metadata to `data/workflows.json`.
      - Document the new playbook in `docs/WORKFLOWS.md`.
3. **Execute the Workflow**:
   - Execute the newly created workflow step-by-step, starting from Step 0.

## Default Workflow Routing

- Product delivery request -> `ship-saas-mvp`
- Security review request -> `security-audit-web-app`
- Agent/LLM product request -> `build-ai-agent-system`
- E2E/browser testing request -> `qa-browser-automation`
- Domain-driven design request -> `design-ddd-core-domain`

## Copy-Paste Prompts

```text
Use @antigravity-workflows to run the "Ship a SaaS MVP" workflow for my project idea.
```

```text
Use @antigravity-workflows and execute a full "Security Audit for a Web App" workflow.
```

```text
Use @antigravity-workflows to guide me through "Build an AI Agent System" with checkpoints.
```

```text
Use @antigravity-workflows to execute the "QA and Browser Automation" workflow and stabilize flaky tests.
```

```text
Use @antigravity-workflows to execute the "Design a DDD Core Domain" workflow for my new service.
```

## Limitations

- This skill orchestrates; it does not replace specialized skills.
- It depends on the local availability of referenced skills.
- It does not guarantee success without environment access, credentials, or required infrastructure.
- For stack-specific browser automation in Go, `go-playwright` may require the corresponding skill to be present in your local skills repository.

## Related Skills

- `concise-planning`
- `brainstorming`
- `workflow-automation`
- `verification-before-completion`
