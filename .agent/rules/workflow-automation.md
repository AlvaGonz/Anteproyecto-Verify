---
trigger: always_on
---

# Rule: workflow-automation
**Scope:** Any agent that reads, creates, or modifies files under `.github/workflows/`  
**Skills invoked:** `github-actions-templates` · `github-workflow-automation` · `git-hooks-automation` · `workflow-orchestration-patterns` · `antigravity-workflows`  
**Risk level:** CRITICAL — pipeline changes affect every merge gate and production deployment

---

## 1. HUMAN GATE — Required Before Any Action

The following are **Type 1 decisions**. The agent MUST stop and request explicit human approval before proceeding:

- Removing or bypassing any of the 12 CI/CD gates defined in `ARCHITECTURE.md § 9. CI/CD Pipeline Flow`
- Changing the trigger conditions on `push` to `main` or any release tag
- Adding `environment: production` or modifying slot-swap steps
- Modifying secret references (`secrets.*`) or permission blocks
- Adding a new third-party Action not previously present in the repository

**If human approval is not received, the agent MUST NOT write the file.**

---

## 2. SHA Pinning — Non-Negotiable

All `uses:` references in any workflow file MUST be pinned to an **immutable commit SHA**, not a mutable tag.

```yaml
# ✅ CORRECT
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2

# ❌ FORBIDDEN — mutable, supply-chain attack surface
- uses: actions/checkout@v4
- uses: actions/checkout@main
- uses: aquasecurity/trivy-action@master
```

**How to resolve a SHA:**
1. Go to the action's GitHub release page.
2. Copy the full commit SHA of the tagged release.
3. Append the version as a comment for human readability.

Anchored to OWASP Supply Chain Security and `actions/starter-workflows` standards.

---

## 3. No Invented YAML Syntax

The agent MUST NOT write GitHub Actions YAML from memory or internal knowledge alone.

**Mandatory workflow:**
1. Load skill `github-actions-templates` and use patterns from `SKILL.md` as the base template.
2. Cross-reference `actions/starter-workflows` for any syntax not covered by the skill.
3. If a valid pattern cannot be found in either source, stop and report: `"Section 2 gap — no verified template for [pattern]. Human input required."`

**Forbidden patterns the agent must never generate:**
- `continue-on-error: true` on security scan steps (CodeQL, Snyk, OWASP ZAP)
- `if: always()` on deployment steps that follow a failed gate
- Hardcoded credentials or tokens inline in YAML
- `workflow_dispatch` without an `environment` protection rule on production jobs

---

## 4. The 12-Gate Pipeline — Immutable Order

The following gate sequence, as defined in `ARCHITECTURE.md § 9`, is **locked**. No agent may reorder, skip, or merge gates without human approval.

| #  | Gate                                       | Failure behavior         |
|----|--------------------------------------------|--------------------------|
| 1  | `dotnet build`                             | Block merge              |
| 2  | Unit tests (`dotnet test` + Moq)           | Block merge              |
| 3  | Coverage ≥ 80% on Domain/Application       | Block merge              |
| 4  | Integration tests (WireMock.NET)           | Block merge              |
| 5  | SonarCloud scan — Critical/Blocker = 0     | Block merge              |
| 6  | ArchUnit layer violation check             | Block merge              |
| 7  | `dotnet-outdated` dependency check         | Block merge              |
| 8  | GitHub Advanced Security secret scan on diff | Block merge            |
| 9  | Docker build + push to ACR                 | Block merge              |
| 10 | Deploy to staging slot                     | Block merge              |
| 11 | OWASP ZAP headless scan on staging         | Block merge              |
| 12 | Smoke test `GET /health` → 200             | Rollback; no slot swap   |

Any PR that modifies `.github/workflows/` MUST include a comment in the PR description mapping every change to a gate number and justifying it.

---

## 5. Git Hooks — Agent Constraints

When modifying or creating hooks under `.git/hooks/` or via `husky` / `lefthook`:

- Pre-commit hooks MAY enforce linting and formatting.
- Pre-push hooks MAY run unit tests.
- **FORBIDDEN:** Any hook that silently passes on error. Exit codes must propagate.
- **FORBIDDEN:** Hooks that skip or modify the behavior of the CI gate sequence.
- All hook scripts MUST use `bash-defensive-patterns` skill conventions (`set -euo pipefail`).

---

## 6. Secrets — Zero Tolerance

- **Never** write a secret value inline in YAML, even as a placeholder.
- All secrets MUST be referenced as `${{ secrets.SECRET_NAME }}` where `SECRET_NAME` is registered in Azure Key Vault and mapped as a GitHub Actions secret.
- Before referencing a new secret, load skill `secrets-management` and verify the Key Vault pattern.
- If a secret name is unknown, the agent MUST ask: `"Provide the Azure Key Vault secret name for [purpose]. Do not guess."`

---

## 7. Rollback Protocol

If a workflow change causes a gate failure after merge:

1. **Do NOT** modify the workflow to skip the failing gate.
2. Revert the workflow file to the last green commit SHA.
3. Open a GitHub Issue tagged `ci-regression` with the failing gate number and error output.
4. Report to human: `"Gate [N] failed after workflow change. Reverted to [commit SHA]. Human decision required before retry."`

---

## 8. Integration with `antigravity-workflows`

`workflow-automation` is allowed to **participate in** orchestration driven by `antigravity-workflows`, but MUST respect the anti-loop DAG and state-machine guarantees of that skill.

### 8.1 When to Call `@antigravity-workflows`

When a requested change to `.github/workflows/` is part of a larger, multi-phase initiative (for example: “ship SaaS MVP”, “full security audit pipeline”, “QA and browser automation hardening”), the agent SHOULD:

1. Ask the human whether to run an orchestrated workflow:
   - `"This CI/CD change looks like part of a larger pipeline evolution. Do you want to run it under @antigravity-workflows (e.g., 'security-audit-web-app' or 'qa-browser-automation')?"`
2. If the human says yes:
   - Use `@antigravity-workflows` to select the appropriate workflow from:
     - `docs/WORKFLOWS.md`
     - `data/workflows.json`
   - Execute the CI/CD-related phases only, following this rule for any `.github/workflows/` edits.

### 8.2 DAG & Anti-Loop Constraint

- `antigravity-workflows` sits **above** `workflow-automation` as an orchestrator.
- `workflow-automation` MAY be *called by* `antigravity-workflows` as a step in a larger playbook.
- **CRITICAL:** Once `antigravity-workflows` has delegated to `workflow-automation` for CI/CD changes, `workflow-automation` MUST NOT call `@antigravity-workflows` again from inside that step. Control flows **downwards only**:
  - Orchestrator (`antigravity-workflows`) → Workflow step (`workflow-automation`) → Atomic actions (`github-actions-templates`, etc.)
- If a CI/CD step fails, `workflow-automation` MUST:
  - Report failure and state to the orchestrator.
  - NOT attempt to “fix” orchestration by re-invoking `@antigravity-workflows`.

### 8.3 Resumability & Idempotency for CI/CD Changes

When invoked as part of an `antigravity-workflows` run:

1. **State Assessment:**
   - Before editing any workflow file, read `.agents/docs/PWF/task_plan.md` to determine:
     - Which CI/CD phases are already complete.
     - Which gate you are currently modifying.

2. **Resumable Execution:**
   - If a previous workflow run partially updated `.github/workflows/`, continue from the last failed or incomplete CI/CD gate.
   - DO NOT reapply already-validated workflow changes unless the source of truth (e.g. `ARCHITECTURE.md § 9`) has changed.

3. **Idempotent Edits (Check-Before-Act):**
   - Before changing a workflow, compare the desired state (from this rule + architecture docs) to the current YAML.
   - If the workflow already matches the required pattern (correct SHA pins, gates intact, secrets correct), skip editing and mark the step as `COMPLETED` in the orchestration report.

### 8.4 Workflow Execution Report

When `workflow-automation` is used as part of an orchestrated run:

1. At the end of the run (success or failure), the orchestrator will:
   - Read `.agents/templates/workflow_execution_report.md`.
   - Populate metrics (e.g., number of workflows touched, gates added/removed, CI runs triggered) including CI/CD-related outputs.
   - Write `.agents/sessions/<session_id>/workflow_execution_report.md`.

2. `workflow-automation` MUST:
   - Provide accurate, structured data about CI/CD edits (which files, which gates, which SHAs) so the report reflects the true state.
   - Avoid any direct writes to `workflow_execution_report.md`; this is the orchestrator’s responsibility.

---

## 9. Verification Checklist (Agent Self-Check)

Before committing any change to `.github/workflows/`:

- [ ] All `uses:` are pinned to full SHA with version comment
- [ ] No new Action introduced without human gate approval
- [ ] No gate removed or reordered from the 12-step sequence
- [ ] No secret value written inline
- [ ] YAML syntax sourced from `github-actions-templates` skill or `actions/starter-workflows`
- [ ] PR description maps each change to a gate number
- [ ] `bash-defensive-patterns` applied to any inline `run:` scripts (`set -euo pipefail`)
- [ ] `ARCHITECTURE.md § 9` updated if a new gate was **added** (with human approval)
- [ ] If run under `antigravity-workflows`, state is synced with `docs/PWF/task_plan.md` and CI/CD-related metrics are available for the execution report