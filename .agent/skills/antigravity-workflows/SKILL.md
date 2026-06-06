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
1. `.agent/workflows/` directory for all workflow `.md` files.
2. `docs/WORKFLOWS.md` for human-readable playbooks.

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
6. **Telemetry & Reporting**: Upon completing or failing the workflow, you MUST read `.agents/templates/workflow_execution_report.md`, populate the YAML metrics with the actual numbers from this session, and save it to `.agents/sessions/<session_id>/workflow_execution_report.md`.

### Playbook Execution Rules (Mandatory Resumability & Idempotency)

1. **State Assessment**: Before commencing any workflow run, the agent MUST check the current session state and audit completed phases.
2. **Resumable Execution**: If a workflow run was previously interrupted or encountered a failure, the agent MUST resume from the exact failed step or gate.
3. **Idempotency Rule (Check-Before-Act)**: Every step or phase MUST be executed idempotently.

## Dynamic Generation Protocol

If the user's task does not match any existing workflow:
1. Discover available skills.
2. Decompose the objective into phases.
3. Select and validate skills for each phase.
4. Incorporate Planning-with-Files & Gates — every workflow MUST start with `Step 0: Initialize Planning Files (@planning-with-files)`.
5. Materialize the workflow by writing it to `.agent/workflows/<slug>.md`.

## Default Workflow Routing
- Product delivery request -> `ship-saas-mvp`
- Security review request -> `security-audit-cicd`
- Agent/LLM product request -> `build-ai-agent-system`
- E2E/browser testing request -> `qa-browser-automation`

## Anti-Loop Guardrail (Mandatory)
A Workflow is strictly forbidden from delegating tasks back upwards to the Orchestrator. Once execution transfers to a Workflow, control flow MUST only move downwards to atomic skills.

## Limitations
- This skill orchestrates; it does not replace specialized skills.
- It depends on the local availability of referenced skills.
