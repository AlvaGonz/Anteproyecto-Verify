---
name: Testing Protocols
description: Applied when writing, running, or debugging tests for VeriFinca.
---

# Testing Protocols (VeriFinca)

> **When to Use**: Apply these rules when writing unit/integration tests (xUnit), frontend tests (Vitest), or E2E tests (Playwright).

## Test Coverage Gates

| Layer | Min Coverage | Reason |
|---|---|---|
| `Domain` | 90% | Core fraud-prevention logic — no regression tolerance |
| `Application` | 80% | All handlers, validators, Rules Engine (OE-1 through OE-7) |
| `Infrastructure.Sealing` | 100% | Law 126-02 compliance — RSA signing path must be fully tested |
| `Infrastructure.ExternalApis` | 70% | Polly retry + circuit breaker paths |

## Backend (xUnit)
- **Unit tests**: `tests/backend/UnitTests/UnitTests.csproj` (Domain + Application). Use xUnit + Moq.
- **Integration tests**: `tests/backend/IntegrationTests/IntegrationTests.csproj` (Requires TestContainers SQL Server + WireMock.NET).
- **API tests**: `src/backend/Api.Tests/Api.Tests.csproj`

### Security Test Categories (Mandatory)
Ensure tests exist for these paths before merging any endpoint:
- `ConsentGateTests.cs` (OE-6: TransUnion blocked without consent)
- `IssueIntegritySealGuardTests.cs` (OE-7: Seal blocked if any FAIL result)
- `DuplicateMatriculaTests.cs` (OE-3: Duplicate detection)
- `RbacTests.cs` (ADMIN/DEVELOPER/VALIDATOR/PUBLIC isolation)
- `DataRetentionPurgeTests.cs` (Law 172-13 TTL enforcement)

## Frontend (Vitest)
- **Command**: `pnpm run test` (from `src/frontend/web`)
- **Quirks**: Uses `pool: 'threads'` (Windows `forks` issue), `jsdom`, `axios-mock-adapter`.

## E2E (Playwright)
- **Command**: `pnpm exec playwright test e2e/<suite>/`
- **Quirks**: Runs sequentially (`fullyParallel: false`, `workers: 1`), auto-starts Vite on port 5173.

## TDD Protocol
Before fixing a bug or adding a feature, you **MUST write a failing unit/integration test first**. Do not write implementation code until the failing test is confirmed.
