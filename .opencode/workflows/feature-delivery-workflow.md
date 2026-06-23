# Feature Delivery Workflow

**Purpose:** End-to-end feature delivery following the Architect → Developer → Reviewer sequence.

## When to Use

When the Orchestrator identifies a request that requires new code, new tests, and a review gate.

## Prerequisites

- Feature request is clear and scoped
- Relevant TRD section exists (or Architect will create it)
- Context files loaded: `processes/feature-delivery-process.md`, `standards/*`

## Workflow Steps

### Step 1: Architect — Spec & Design

1. Route to `@architect-agent` with the feature request
2. Architect reads TRD, existing diagrams, prior ADRs
3. Architect updates Mermaid diagrams in ARCHITECTURE.md
4. Architect writes ADR if needed
5. Architect defines interface contracts
6. Architect presents spec for human confirmation

**Output:** Approved spec with diagrams, contracts, ADR

### Step 2: Developer — Implementation

1. Route to `@developer-agent` with approved spec
2. Developer reads spec and referenced TRD section
3. Developer writes failing test (TDD — red)
4. Developer implements feature with FluentValidation + ILogger
5. Developer verifies all tests pass (green)
6. Developer commits with conventional commit message

**Output:** Feature implementation + passing tests

### Step 3: Reviewer — Audit

1. Route to `@reviewer-agent` with the diff
2. Reviewer runs security checklist
3. Reviewer checks architecture compliance
4. Reviewer verifies test coverage
5. Reviewer approves or returns with findings

**Output:** Review report + approval/rejection

### Step 4: Merge

1. If approved → merge to target branch
2. If rejected → return to appropriate step with findings

## Verification Checklist

- [ ] All tests pass (`dotnet test`)
- [ ] No archunit violations
- [ ] Security checklist passes
- [ ] FluentValidation on all new DTOs
- [ ] Structured logging on entry/success/failure
- [ ] Polly resilience on new HTTP clients
- [ ] Idempotency for metered APIs
- [ ] Coverage ≥80% on new Domain + Application code
