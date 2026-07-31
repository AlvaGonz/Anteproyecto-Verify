---
name: Skill Orchestration
description: Guidelines for combining modular skills to execute complex workflows in VeriFinca.
---

# Skill Orchestrator

> **When to Use**: Apply these rules when planning multi-step tasks that require different domains (e.g., adding an API, testing it, and securing it).

## How to Choose Skills
- **Do not load all skills**: Pick 3–5 specific skills based on the task role (e.g., Architect, Developer, Reviewer).
- **Check SKILL_SELECTION.md**: Use the required and optional skills defined for the VeriFinca workspace.

## Concrete Example Chains

### 1. New API Endpoint (Backend)
- **Design**: `@api-design-principles` (Draft the REST contract and DTOs).
- **Implement**: `@dotnet-best-practices` + `@clean-architecture` (Write the Handler, Validator, and Controller).
- **Test**: `@test-driven-development` (Write xUnit tests mocking dependencies).
- **Secure**: `@agents-security` (Verify RBAC and Law 172-13 gates).

### 2. Frontend Feature with QA
- **Implement**: `@react-best-practices` + `@typescript-pro` (Build the UI component using Stitch design tokens).
- **Test**: `@react-test` (Write Vitest unit tests for the component).
- **E2E Validation**: `@e2e-testing` + `@playwright-e2e-testing` (Write Playwright test for the user flow).
- **Accessibility**: `@wcag-audit-patterns` (Verify a11y compliance).

### 3. Security Audit & Refactor
- **Scan**: `@vulnerability-scanner` (Run SAST/SCA checks).
- **Review**: `@security-review` (Audit Key Vault usage, DB queries, and JWT handlers).
- **Refactor**: `@dotnet-design-pattern-review` (Fix identified issues safely).
