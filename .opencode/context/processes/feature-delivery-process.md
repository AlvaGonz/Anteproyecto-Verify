# VeriFinca — Feature Delivery Process

## Overview

The VeriFinca feature delivery process follows a strict **Architect → Coder → Reviewer** sequence. No agent skips a stage. This prevents context drift, security gaps, and architectural violations.

## Process Flow

```
[Request] → [Orchestrator routes to Architect] → [Spec + Diagrams] →
[Developer implements] → [Tests pass] → [Reviewer audits] → [Merge]
```

## Stage 1: Architect

1. Read relevant `.agents/docs/TRD_VeriFinca.md` section
2. Read existing `.agents/docs/ARCHITECTURE.md` diagrams
3. Read existing `.agents/docs/ADR/` for context
4. Update or create Mermaid diagrams
5. Write ADR if new pattern/library is introduced
6. Define interfaces and contracts
7. Present spec for human approval

**Output:** Updated TRD, ARCHITECTURE.md, new ADR, interface contracts

## Stage 2: Developer

1. Read approved spec and referenced files
2. Write failing unit test (TDD)
3. Implement feature with FluentValidation + ILogger
4. Wire dependencies through DI
5. Run `dotnet test` — all green
6. Commit with conventional commit message

**Output:** Production code + tests, all passing

## Stage 3: Reviewer

1. Review diff against spec (no scope creep)
2. Run security checklist (OWASP, IDOR, consent guards)
3. Check architecture compliance (Clean Architecture rules)
4. Verify test coverage (≥80% on new code)
5. Check structured logging and observability
6. Approve or reject with findings

**Output:** Review report + approval/rejection

## Commit Convention

```
type(scope): description

types: feat | fix | test | docs | refactor | security | compliance
scope: api | app | infra | domain | ui | worker | compliance
```

Examples:
- `feat(api): add POST /projects/{id}/validations/credit endpoint`
- `security(app): add IDOR guard on ProjectsController`
- `compliance(worker): implement data retention purge job`
