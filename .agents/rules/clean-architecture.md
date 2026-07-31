---
name: Clean Architecture Rules
description: Enforces layer dependency boundaries and Clean Architecture patterns for VeriFinca.
---

# Clean Architecture Rules

> **When to Use**: Apply these rules when adding new classes, interfaces, or modifying dependencies between projects in the backend.

## Layer Dependency Contract (ABSOLUTE)
Inner layers never know outer layers exist. Dependency flows inward: `Api` → `Application` → `Domain` ← `Infrastructure`.

### 1. `VeriFinca.Api` (UI/Controllers)
- **Role**: HTTP endpoints, request routing, Auth/RBAC filters.
- **Rule**: Dispatch ONLY via `IMediator.Send()` or `IMediator.Publish()`.
- **Rule**: NEVER instantiate Domain entities (e.g., `new Project()`).
- **Rule**: NEVER reference `VeriFinca.Infrastructure` or instantiate DbContext/Repositories.
- **Rule**: Controllers contain zero business logic.

### 2. `VeriFinca.Application` (Use Cases)
- **Role**: Command/Query handlers, Validators, DTOs, Business Rules orchestration.
- **Rule**: Handlers must call interfaces (`IProjectRepository`, `IOcrService`), NEVER concrete classes.
- **Rule**: One `AbstractValidator<TDto>` per DTO (FluentValidation). No inline `if (dto.X == null)` in handlers.
- **Rule**: NEVER reference `VeriFinca.Infrastructure`.
- **Rule**: Emit Domain events and interact strictly via abstractions.

### 3. `VeriFinca.Domain` (Core)
- **Role**: Entities, Enums, Exceptions, Repository/Service Interfaces.
- **Rule**: Zero outbound dependencies. Cannot reference ANY other layer.
- **Rule**: Contains pure domain logic, invariants, and business rules.

### 4. `VeriFinca.Infrastructure` (Implementation)
- **Role**: EF Core DbContext, API Clients, Service Bus, Key Vault.
- **Rule**: Implements `Application.Interfaces` and `Domain.Interfaces`.
- **Rule**: All Dependency Injection lives EXCLUSIVELY in `DependencyInjection.cs`.
- **Rule**: Never dispatch MediatR commands or enforce domain rules here.

## Architectural Mandates
| Rule | Why | Example |
|---|---|---|
| **No direct EF Core mocking** | Brittle tests | Mock `IProjectRepository` via Moq, not `AppDbContext`. |
| **ArchUnit Gate (FAIL5)** | Enforces layer isolation | CI fails if `Api` references `Infrastructure`. Do not bypass. |
| **Update `ARCHITECTURE.md`** | Living documentation | Update C4 diagram when adding a new external API. |