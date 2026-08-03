# /verify-architecture

**Purpose:** Verify that the codebase conforms to the VeriFinca architecture specifications.

## Usage

```
/verify-architecture [--strict] [--scope=<layer>]
```

## Options

| Option | Description |
|--------|-------------|
| `--strict` | Fail on any violation (default: warn) |
| `--scope=api` | Only check Api layer |
| `--scope=app` | Only check Application layer |
| `--scope=infra` | Only check Infrastructure layer |
| `--scope=domain` | Only check Domain layer |

## Checks Performed

1. **Clean Architecture Layers** — Verify no forbidden cross-layer references
2. **CQRS Pattern** — Verify one handler per command/query
3. **FluentValidation** — Verify all DTOs have validators
4. **RBAC Attributes** — Verify all controllers have role attributes
5. **Security Headers** — Verify middleware configured
6. **Serilog Setup** — Verify structured logging configuration
7. **Polly Resilience** — Verify external HTTP clients have retry policies
8. **Mermaid Diagram Sync** — Verify diagrams match actual code structure

## Output

```
VeriFinca Architecture Report
=============================
✅ Layers: All Clean Architecture rules pass
✅ CQRS: All handlers follow one-per-command pattern
⚠️  Validators: 2 DTOs missing FluentValidation (see details)
❌ Security: RBAC missing on ProjectsController.Create

Details:
  - src/VeriFinca.Api/Controllers/ProjectsController.cs:38 — Missing [Authorize(Roles="DEVELOPER")]
```

## Related

- Routes to `@reviewer-agent` for detailed analysis
- Loads `context/standards/code-quality-standards.md` (Clean Architecture, CQRS)
- References `.agents/docs/ARCHITECTURE.md` (§8 Clean Architecture Dependency Rules)
