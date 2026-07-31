---
name: Code Style & Consistency
description: Rules for maintaining consistent coding style, formatting, and patterns across the VeriFinca codebase.
---

# Code Style Consistency

> **When to Use**: Apply these rules before implementing features to ensure new code matches the established project style.

## Language-Specific Style Delegation

Instead of duplicating style rules, **always consult the specific skill** for the language/framework you are using:

| Domain | Required Skill | Focus Areas |
|---|---|---|
| **C# / .NET Backend** | `@dotnet-best-practices` | C# 12 features, Clean Architecture, MediatR, FluentValidation |
| **TypeScript / React** | `@typescript-pro`, `@react-patterns` | Strict typing, React 19 hooks, component structure |
| **Testing** | `@test-driven-development`, `@react-test` | xUnit, Vitest, Mocking, E2E structure |
| **UI / Styling** | `@stitch-ui-design` | Tailwind CSS classes, Design Tokens (`#F98513`, etc.) |

## Global Consistency Principles

When reviewing or writing code, adhere to these universal style constraints:

| Rule | Why | Example |
|---|---|---|
| **Pattern Mirroring** | Predictability | Copy structural patterns from similar handlers or components instead of inventing new ones. |
| **Consistent Naming** | Readability | C#: `PascalCase` classes/methods, `camelCase` args. TS: `PascalCase` components, `camelCase` functions. |
| **No Boilerplate** | Maintainability | Do not add interfaces/abstractions that weren't requested. Keep it simple (YAGNI). |
| **Early Returns** | Cognitive Load | Prefer guard clauses over nested `if/else` blocks. |
| **Async / Await** | Standard Practice | Use `async/await` instead of `.then()/.catch()` promise chains. |

## Pre-Implementation Checklist
1. **Identify Patterns**: Examine 3-5 recently modified files in the target directory to catalog the dominant style.
2. **Review Skill**: Verify the intended implementation matches the associated language skill (`@dotnet-best-practices` / `@react-patterns`).
3. **Adapt**: Structure new modules, error handling, and tests to mirror the existing conventions perfectly.