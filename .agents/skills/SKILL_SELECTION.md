# Curated Skill Selection for VeriFinca

This file defines the strict subset of skills applicable to the VeriFinca monorepo. It aligns with the bundles defined in the standard workspace guidelines. **Do not load all skills globally. Only load 3-5 skills relevant to your current role/task.**

## 🌟 Required Skills (Always Applicable)
- `@test-driven-development`: Mandatory before writing implementation code.
- `@clean-architecture`: Mandatory for all backend development.
- `@workflow-patterns`: Used when orchestrating multi-step workflows.

## 💻 Full-Stack Developer Bundle
> **Load when:** Building UI components, setting up API endpoints, or modifying database schemas.

### Frontend (React / TypeScript)
- `@react-patterns` / `@react-best-practices`: Hooks, state management, and component hierarchy.
- `@typescript-pro`: Strict type safety, advanced generics for API clients.
- `@stitch-ui-design`: VeriFinca specific design tokens and UI building blocks.

### Backend (.NET / C#)
- `@dotnet-best-practices`: C# 12 patterns, MediatR, FluentValidation.
- `@dotnet-design-pattern-review`: Validating handlers, repositories, and CQRS patterns.
- `@api-design-principles`: REST APIs, routing, and pagination.
- `@sql-optimization-patterns`: EF Core optimization and query design.

## 🛡️ Security Engineer Bundle
> **Load when:** Implementing Auth, Law 172-13/126-02 compliance, or fixing vulnerabilities.
- `@owasp-security`: OWASP Top 10 enforcement and validation.
- `@secrets-management`: Key Vault interactions and JWT signing.
- `@vulnerability-scanner`: SAST/SCA and checking supply chain security.
- `@security-review`: Code review focused on injection, RBAC, and Auth logic.

## 🧪 QA & Testing Bundle
> **Load when:** Writing xUnit tests, Vitest unit tests, or Playwright E2E flows.
- `@e2e-testing`: Playwright specific Page Object Models and CI integration.
- `@playwright` / `@playwright-cli`: Specific syntax and assertions for Playwright.
- `@quality-qa`: QA matrix testing, test coverage analysis.
- `@wcag-audit-patterns`: Accessibility compliance testing.
- `@ui-visual-validator`: UI state and visual regression tests.

---

## Archiving Non-Relevant Skills
The remaining skills from the full `antigravity-awesome-skills` repository are considered **Out of Scope** (e.g., Python, Vue, Rust, red-team tools) and should be moved to `.agents/skills/archive/` to prevent context bloat. You can use the provided script `.agents/scripts/archive_unused_skills.ps1` to perform this cleanup.
