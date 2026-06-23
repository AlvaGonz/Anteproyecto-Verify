# Validation Pipeline Workflow

**Purpose:** Implement or modify the async validation pipeline (OCR, government APIs, credit check).

## When to Use

- Adding a new validation step or external API
- Modifying the Service Bus message schema
- Implementing a new OCR document type
- Changing retry/circuit breaker policies
- Adding idempotency to a new client

## Prerequisites

- External API contract documented
- TRD §3 (Async Validation) and §10 (External Integrations) reviewed
- Service Bus queue configuration confirmed

## Workflow Steps

### Step 1: Design (Architect or Validation Agent)

1. Update ARCHITECTURE.md sequence diagram (§4) for the new flow
2. Write ADR if introducing a new external provider
3. Define client interface in Application layer (`I*Service`)
4. Define message schema if modifying Service Bus contract
5. Define idempotency key format if adding new client

### Step 2: Implement Client (Validation Agent or Developer)

1. Implement interface in Infrastructure layer
2. Add Polly resilience pipeline (retry + circuit breaker + timeout)
3. Add idempotency cache logic (Redis)
4. Register client in DependencyInjection.cs
5. Wire into ValidationJobConsumer step pipeline
6. Add structured logging per TRD §11 schema

### Step 3: Test (Developer)

1. Unit test: mock external API, verify retry behavior
2. Integration test: WireMock.NET for external API, TestContainers for SQL
3. Test idempotency cache hit vs miss
4. Verify fallback path when API unavailable
5. Verify structured log events emitted with correct schema

### Step 4: Review (Reviewer)

1. Verify security: SSRF guard, API key in Key Vault, no secrets in logs
2. Verify resilience: Polly policies match TRD spec
3. Verify idempotency: key format, TTL, hit/miss behavior
4. Verify compliance: consent gate for TransUnion, data retention TTL

## Key Files

- `src/VeriFinca.Infrastructure/ExternalApis/*Client.cs`
- `src/VeriFinca.Infrastructure/Messaging/ValidationJobConsumer.cs`
- `src/VeriFinca.Infrastructure/Caching/RedisIdempotencyCache.cs`
- `src/VeriFinca.Infrastructure/DependencyInjection.cs`
- `src/VeriFinca.Application/Interfaces/I*Service.cs`
