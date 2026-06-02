# Antigravity Workflows Catalog

Welcome to the **Antigravity Workflows Catalog**. This document describes all available meta-workflows designed to orchestrate agent operations, enforce quality standards, and coordinate complex tasks in this repository.

## The Operational Model

All workflows follow a rigid, multi-phase operational model designed for security and reliability:

1. **Step 0: Initialization (`@planning-with-files`)**: Every workflow must initialize the local planning database (`.agents/docs/PWF/task_plan.md`) with the task objectives and the phase checklist before any other action.
2. **Validation Gates (`GATE:`)**: Critical phases are separated by validation gates. If a gate check fails, execution immediately halts, preventing cascading failures or corrupted codebases.

---

## Catalog of Workflows

| ID | Name | Category | Trigger / Purpose | Required Skills |
|:---|:---|:---|:---|:---|
| `new-feature` | New Feature Implementation | Development | Cuando vas a implementar una nueva funcionalidad | `@planning-with-files` |
| `ci-autofix` | CI Failure Auto-Heal Loop | CI/CD | When a CI/CD build or compilation failure is detected | `@planning-with-files`, `@error-pattern-mining`, `@tdd-workflow` |
| `debug-session` | Debug Session Workflow | Debugging | Cuando encuentras un error o comportamiento inesperado | `@planning-with-files` |
| `verify-boundaries` | Architecture Boundary Verification | Quality QA | Before refactoring to ensure frontend/backend/DB layers are isolated | `@planning-with-files` |
| `audit-chores` | Comprehensive Codebase Audit | Quality QA | Periodic audit of codebase layout, dead code, and domains | `@planning-with-files` |
| `cleanup-dead-code` | Dead Code Elimination | Maintenance | Reclaiming repository clean state by deleting unused files/exports | `@planning-with-files` |
| `restructure-frontend` | Feature-Based Frontend Restructure | Refactoring | Enforcing feature-based structure (`src/features/<domain>/`) | `@planning-with-files` |
| `restructure-backend` | Domain-Module Backend Restructure | Refactoring | Enforcing module-based structure (`server/src/modules/<domain>/`) | `@planning-with-files` |
| `memory-sync` | Cross-Session Memory Load | Maintenance | Runs at session start to load unresolved risks and lessons | `@planning-with-files` |
| `post-task-hook` | Post-Task Hook Evaluation | CI/CD / QA | Auto-run after every task to analyze quality using the agent loop | `@planning-with-files` |
| `coverage-backlog` | Coverage Backlog Generation | Quality QA | Generating test specs for domains with low coverage (< 20%) | `@planning-with-files`, `@coverage-evolution` |
| `error-digest` | Error Digest Generation | Quality QA | Summarizing recurring error patterns from session history | `@planning-with-files` |
| `evolve-prompts` | LOW-FITNESS Evolution Workflow | Maintenance | Optimizing underperforming agent skill structures | `@planning-with-files` |
| `evolve-skills` | LOW-FITNESS Skill Evolution | Maintenance | Mutating agent skill prompts with low fitness scores | `@planning-with-files`, `@skill-fitness` |

---

## How Workflows are Orchestrated

When a task requires multiple phases, the **Antigravity Skill Orchestrator** automatically delegates high-level planning and tracking to this workflows engine:

1. **Orchestrator** intercepts a complex multi-phase task.
2. **Orchestrator** delegates to `@antigravity-workflows`.
3. **Workflows Engine** dynamically loads or generates the target workflow.
4. **Execution** is traced phase-by-phase using validation gates.
