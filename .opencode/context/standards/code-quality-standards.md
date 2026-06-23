# VeriFinca — Code Quality Standards

## Mandatory Patterns

### Clean Architecture
```
VeriFinca.Api         → VeriFinca.Application only (never Infrastructure or Domain)
VeriFinca.Application → VeriFinca.Domain only (never Infrastructure)
VeriFinca.Infrastructure → VeriFinca.Domain + Application.Interfaces
VeriFinca.Domain      → No dependencies on any other layer
```

### CQRS with MediatR
- One Command/Query per file
- One Handler per Command/Query (no shared handlers)
- All DTOs are C# records (immutable)
- FluentValidation registered as MediatR pipeline behavior

### Dependency Injection
- All interface bindings in `Infrastructure/DependencyInjection.cs`
- Api layer calls `builder.Services.AddInfrastructure()`
- No `new` instantiation of services in Api layer

### External HTTP Clients
- Registered via `services.AddHttpClient<IInterface, Implementation>()`
- Polly resilience pipeline (retry + circuit breaker + timeout + bulkhead)
- Idempotency via Redis for metered APIs

### Structured Logging
- Serilog with Application Insights sink
- `ILogger<T>` injected through DI
- Log on entry, success, and failure of every handler
- No `Console.WriteLine` or `Debug.Write`

## Testing Standards

### Unit Tests (xUnit + Moq)
- Cover Domain logic and Application handlers
- Cover all guard conditions (validation, authorization, consent)
- Minimum 80% coverage on Domain + Application
- One test class per handler/entity

### Integration Tests (TestContainers + WireMock.NET)
- Real SQL Server via TestContainers
- Mocked external APIs via WireMock.NET
- Cover full validation pipeline
- Service Bus integration tests

### Security Tests
- IDOR tests for every `{id}` parameter
- RBAC bypass attempts
- Consent guard bypass attempts
- SQL injection attempts on string inputs

## Code Review Gates
- Zero build errors
- Zero test failures
- Zero archunit violations
- Zero critical/blocker SonarCloud issues
- Zero secrets in diff
- Zero high-severity OWASP ZAP findings
