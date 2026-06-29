---
trigger: always_on
---

# Clean Architecture Rules

> Skills: `architecture-patterns` · `architecture` · `dotnet-best-practices` · `dotnet-design-pattern-review`
> Reference: `ARCHITECTURE.md § 8` · `TRD § 1.1 – 1.2` · ArchUnit CI gate (FAIL5)

---

## Layer Dependency Contract (ABSOLUTE — zero tolerance)

The four layers are ordered by dependency direction. **Inner layers never know outer layers exist.**
VeriFinca.Domain ← No dependencies
VeriFinca.Application ← Domain only
VeriFinca.Infrastructure ← Application.Interfaces + Domain only
VeriFinca.Api ← Application only (via MediatR dispatch)

text

### Forbidden Cross-Layer References

- **`VeriFinca.Api` → `VeriFinca.Infrastructure`** — NEVER. Api dispatches `IMediator.Send(command)`. It never touches `AppDbContext`, `SqlProjectRepository`, or any Infrastructure class directly.
  - verify: `grep -r "using VeriFinca.Infrastructure" --include="*.cs" src/VeriFinca.Api/` must return 0 matches.

- **`VeriFinca.Api` → `VeriFinca.Domain`** — NEVER directly. Domain types may appear in DTOs only if passed through an Application layer abstraction. Controllers do not instantiate Domain entities.
  - verify: `grep -r "new Project\|new Document\|new IntegritySeal\|new ConsentRecord" --include="*.cs" src/VeriFinca.Api/` must return 0 matches.

- **`VeriFinca.Application` → `VeriFinca.Infrastructure`** — NEVER. Application calls interfaces (`IProjectRepository`, `IOcrService`, `ISealingService`). It never references a concrete implementation class.
  - verify: `grep -r "using VeriFinca.Infrastructure" --include="*.cs" src/VeriFinca.Application/` must return 0 matches.

- **`VeriFinca.Domain` → any other layer** — NEVER. Domain has zero outbound project references.
  - verify: `cat src/VeriFinca.Domain/VeriFinca.Domain.csproj` must contain no `<ProjectReference>` entries.

---

## Dependency Injection Wiring

All interface-to-implementation bindings live **exclusively** in:
src/VeriFinca.Infrastructure/DependencyInjection.cs

text
Registered in `Program.cs` via `builder.Services.AddInfrastructure(builder.Configuration)`.

- **`new ConcreteRepository()`** is forbidden outside of `DependencyInjection.cs`. No agent may manually instantiate `SqlProjectRepository`, `AzureDocumentIntelligenceService`, `ServiceBusPublisher`, or any Infrastructure class.
  - verify: `grep -rn "new SqlProjectRepository\|new AppDbContext\|new ServiceBusPublisher\|new CertificationEngine\|new RiClient\|new TransUnionClient" --include="*.cs" src/` must return 0 matches.

- **Test projects** must use Moq to mock interfaces (`IProjectRepository`, `IOcrService`, etc.). Never mock EF Core `DbContext` directly in unit tests — use repository interfaces.

---

## MediatR Dispatch Pattern (Api Layer)

Controllers dispatch **only** via `IMediator.Send()` or `IMediator.Publish()`. Zero business logic inside controllers.

```csharp
// CORRECT
var result = await _mediator.Send(new RegisterProjectCommand(dto), ct);

// WRONG — never do this in a controller
var project = new Project(dto.Name, dto.RNC);   // Domain instantiation in Api
_dbContext.Projects.Add(project);               // Infrastructure call in Api
await _dbContext.SaveChangesAsync(ct);
```

- verify: Controller files must contain no `DbContext`, no `Repository`, no `new Project()`, no `new Document()` references.
  - `grep -rn "DbContext\|Repository\b\|new Project\b\|new Document\b" --include="*.cs" src/VeriFinca.Api/Controllers/` must return 0 matches.

---

## Handler Responsibility Boundaries

| Layer | Allowed | Forbidden |
|---|---|---|
| `VeriFinca.Api` — Controllers | `IMediator.Send`, `IMediator.Publish`, map DTO to command/query, return HTTP result | Business logic, DB access, Infrastructure instantiation |
| `VeriFinca.Application` — Handlers | Call interfaces (`IProjectRepository`, `IOcrService`), emit Domain events, call `ISealingService` | `new SqlX()`, `AppDbContext`, Azure SDK calls, raw HTTP calls |
| `VeriFinca.Infrastructure` — Repos/Services | Implement Application interfaces, use EF Core, call Azure SDKs | Business logic, MediatR dispatch, Domain rule enforcement |
| `VeriFinca.Domain` — Entities/Interfaces | Pure domain logic, invariants, exceptions, interface contracts | Any framework reference, any infrastructure concern |

---

## FluentValidation Placement

- One `AbstractValidator<TDto>` class per DTO. Located in `VeriFinca.Application/Validators/`.
- Registered via Assembly scan in `DependencyInjection.cs` — never manually registered per-handler.
- **No inline validation** (`if (dto.Name == null)`) inside handler `Handle()` methods. Validation runs in the MediatR pipeline behavior before the handler executes.
  - verify: `grep -rn "if.*dto\." --include="*Handler.cs" src/VeriFinca.Application/` must return 0 matches.

---

## Diagram Update Protocol (MANDATORY before commit)

Before committing **any** change that alters a service boundary, data flow, or layer interaction, the agent **MUST** update the corresponding diagram in `ARCHITECTURE.md` in the **same commit**. No implementation commit without a diagram sync.

| Change Type | Diagram to Update |
|---|---|
| New external API integration | C4 Level 1, C4 Level 2, §10 Infrastructure Topology |
| New Service Bus message type | §4 Async Validation Flow |
| New domain entity or relationship | §7 ERD |
| New API endpoint | §3 C4 Level 3 Component Diagram |
| New Application command/query | §3 C4 Level 3 Component Diagram |
| New business rule guard | §5 or §6 Sequence/Flowchart |
| New Azure resource | §10 Infrastructure Topology |
| New MediatR handler with external dependency | §4 or §5 Sequence Diagram |

- verify: Any PR that adds a file in `src/VeriFinca.Infrastructure/ExternalApis/` or `src/VeriFinca.Application/Commands/` must also contain a diff in `ARCHITECTURE.md`.

---

## ArchUnit CI Gate (FAIL5 — blocks merge)

The CI pipeline runs `dotnet-archunit` as gate step 5. A layer violation **blocks merge with no exceptions**.

- Never disable or skip the ArchUnit test project (`VeriFinca.Tests.Architecture`).
- Never add `[Ignore]` to an ArchUnit test to unblock a PR. Fix the violation instead.
- If ArchUnit reports a violation locally, **STOP**. Do not push. Revert the offending reference and resolve via the correct interface abstraction pattern.

```bash
# Run locally before any push
dotnet test src/VeriFinca.Tests/VeriFinca.Tests.Architecture.csproj --no-build
# Expected: 0 failures
```

---

## New Interface Checklist

When adding a new external dependency (new government API, new Azure service):

1. Define the interface in `VeriFinca.Domain/Interfaces/` or `VeriFinca.Application/Interfaces/` — not in Infrastructure.
2. Implement the interface in `VeriFinca.Infrastructure/ExternalApis/` or `/Persistence/`.
3. Register the binding in `VeriFinca.Infrastructure/DependencyInjection.cs`.
4. Add secret to Key Vault inventory (`TRD §5`) — never hardcode endpoint or key.
5. Add Polly resilience pipeline (`TRD §10.1`) — retry + circuit breaker + timeout.
6. Update `ARCHITECTURE.md` C4 Level 1, C4 Level 2, and §10 Infrastructure Topology in the same commit.
7. Write a WireMock.NET integration test before implementation (TDD — failing test first).