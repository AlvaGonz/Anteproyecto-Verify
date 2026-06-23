# VeriFinca — .opencode Navigation

## System Overview

This `.opencode/` system provides AI agent orchestration for the VeriFinca real estate verification platform. It integrates with the existing `.agents/` directory (skills, workflows, docs, rules) to provide a complete context-aware development environment.

## Directory Structure

```
.opencode/
├── agent/
│   ├── verifinca-orchestrator.md        ← Main entry point — routes all requests
│   └── subagents/
│       ├── architect-agent.md           ← Specs, diagrams, ADRs
│       ├── developer-agent.md           ← Implementation + tests (TDD)
│       ├── reviewer-agent.md            ← Security + architecture audits
│       ├── validation-workflow-agent.md ← Async validation pipeline
│       └── compliance-agent.md          ← Law 172-13/126-02 compliance
├── context/
│   ├── domain/
│   │   ├── verifinca-domain-overview.md  ← Project overview, stakeholders, stack
│   │   ├── government-integrations.md    ← RI, DGII, Catastro, TransUnion APIs
│   │   └── legal-framework.md           ← Law 172-13, Law 126-02 compliance
│   ├── processes/
│   │   ├── feature-delivery-process.md  ← Architect → Developer → Reviewer flow
│   │   └── validation-pipeline.md       ← Async validation step-by-step
│   ├── standards/
│   │   ├── code-quality-standards.md    ← Clean Architecture, CQRS, testing
│   │   └── security-standards.md        ← OWASP, RBAC, secret management
│   └── templates/
│       └── adr-template.md              ← ADR template for architectural decisions
├── command/
│   ├── new-feature.md                   ← Start feature delivery workflow
│   ├── verify-architecture.md           ← Check architecture compliance
│   └── run-security-audit.md           ← Run security + compliance audit
└── workflows/
    ├── feature-delivery-workflow.md     ← End-to-end feature delivery
    ├── validation-pipeline-workflow.md  ← Async validation implementation
    └── security-audit-workflow.md       ← Security review process
```

## Quick Start

### New Feature
```
/new-feature "Add geolocation validation" --trd-section="§4, RF-7"
```

### Security Audit
```
/run-security-audit
```

### Architecture Verification
```
/verify-architecture --strict
```

## Context File Loading Order

For maximum efficiency, load context files in this order based on task type:

### Feature Implementation
1. `context/domain/verifinca-domain-overview.md`
2. `context/processes/feature-delivery-process.md`
3. `context/standards/code-quality-standards.md`
4. `.agents/docs/TRD_VeriFinca.md` (relevant section)
5. `.agents/docs/ARCHITECTURE.md` (relevant diagrams)

### Security Work
1. `context/standards/security-standards.md`
2. `context/domain/legal-framework.md`
3. `.agents/docs/AGENTS.md`
4. `.agents/docs/TRD_VeriFinca.md` (§6 Shift-Left Security)

### Validation Pipeline
1. `context/domain/government-integrations.md`
2. `context/processes/validation-pipeline.md`
3. `context/standards/code-quality-standards.md`
4. `.agents/docs/TRD_VeriFinca.md` (§3 Async Validation, §10 External Integrations)

## Integration with `.agents/`

| `.agents/` Asset | How `.opencode/` Uses It |
|-------------------|--------------------------|
| `.agents/docs/TRD_VeriFinca.md` | Primary technical spec reference |
| `.agents/docs/ARCHITECTURE.md` | C4 diagrams + ERD for architecture work |
| `.agents/docs/AGENTS.md` | Agent constitution — roles, protocols, rules |
| `.agents/docs/PRD_VeriFinca.md` | Product requirements for context |
| `.agents/docs/DESIGN.md` | UI design tokens for frontend work |
| `.agents/workflows/` | Existing workflow definitions |
| `.agents/skills/` | 80 specialized skills for various tasks |
| `.agents/rules/` | Repository conventions and protocols |
