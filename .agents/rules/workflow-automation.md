---
name: Workflow Automation
description: Guidelines for triggering automated workflows and CI/CD pipelines in VeriFinca.
---

# Workflow Automation

> **When to Use**: Apply these rules when executing standard development lifecycles (build, test, security scan) or relying on automated processes.

## Workflow Execution Rules
- **Prefer predefined workflows**: Use existing `.agents/workflows/*.md` files instead of creating ad-hoc processes.
- **Workflow Triggers**: Trigger workflows contextually based on the current task (e.g., run `ci-autofix.md` when CI fails).

## Concrete Example Chains

### 1. Build and Fix Loop
- **Trigger**: Local build failure or type error.
- **Execute**: `@build-fix` (Diagnose build system, apply incremental fixes).
- **Verify**: Re-run build command until 0 errors.

### 2. CI/CD Autofix
- **Trigger**: GitHub Actions pipeline fails (e.g., archunit violation, test failure).
- **Execute**: `@ci-autofix` (Read GitHub MCP logs, extract error patterns, apply TDD fixes).
- **Verify**: Push changes and monitor CI status via GitHub MCP.

### 3. Security Scanning
- **Trigger**: Pre-merge or major refactor.
- **Execute**: `@security-scan` (Run AgentShield/vulnerability scanners against the diff).
- **Action**: Fix any HIGH/CRITICAL findings before merging.

### 4. Quality Gate
- **Trigger**: Code implementation is complete.
- **Execute**: `@quality-gate` (Run formatters, linters, and verify against code style rules).
- **Verify**: Ensure the post-task hook (`.agents/scripts/post_task_loop.py`) succeeds.
