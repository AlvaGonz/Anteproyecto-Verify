# ADR-001: Azure Service Bus for Asynchronous Validation Decoupling

**Date:** 2026-05-25
**Status:** Accepted
**Supersedes:** N/A
**Referenced in:** `TRD_VeriFinca.md §3` · `ARCHITECTURE.md §4`

---

## Context

VeriFinca's validation pipeline calls 5 external systems per project: Azure AI Document Intelligence (OCR), Registro Inmobiliario, Catastro Nacional, DGII, and TransUnion DR. Combined p95 latency for all calls in sequence exceeds 15–30 seconds under normal conditions. Blocking an HTTP request thread for that duration causes:

- ASP.NET Core thread pool exhaustion under concurrent load
- Client-side timeout errors (default browser timeout: 30s)
- No retry capability on partial failure (one failed API call fails the entire request)
- No audit trail of job execution state

An alternative considered was **synchronous sequential execution within the HTTP handler** (simplest path). This was rejected because it violates the 2026 production requirement of sub-3s HTTP response times and makes partial failure recovery impossible without re-triggering the full pipeline.

A second alternative considered was **Hangfire background jobs** (SQL-backed). Rejected because it requires a polling loop against the SQL database, adding unnecessary read load, and lacks the native DLQ, message lock, and replay capabilities of a managed message broker.

---

## Decision

All document validation jobs are decoupled from the HTTP request cycle using **Azure Service Bus Standard tier** with a dedicated queue `verifinca-validation-jobs`.

The HTTP endpoint `POST /projects/{id}/validations/trigger` enqueues a `ValidationJobMessage` and immediately returns `202 Accepted` with a `pollUrl`. A `ValidationJobConsumer` (ASP.NET `IHostedService`) processes the message asynchronously, executing all external API calls and writing `ValidationResults` to Azure SQL.

---

## Consequences

**Positive:**
- HTTP response time reduced to <200ms (queue enqueue only)
- Per-step retry is handled independently; a DGII failure does not re-trigger OCR
- Native DLQ captures poison messages after 3 delivery attempts
- `correlationId` from the HTTP request is propagated through the message envelope, maintaining distributed trace continuity in Application Insights
- Zero thread pool exhaustion risk under concurrent validation load

**Negative:**
- Adds operational complexity: DLQ must be monitored and manually requeued via `POST /admin/validations/requeue/{messageId}` (ADMIN role)
- Developers must poll `GET /projects/{id}/validations` for results — no push notification in MVP
- Local development requires Azure Service Bus emulator or Azurite equivalent

**Risks:**
- **Message loss on worker crash mid-processing:** Mitigated by Service Bus message lock (5 min). If the worker crashes, the lock expires and the message is redelivered up to `MaxDeliveryCount = 3`.
- **DLQ accumulation:** Mitigated by Application Insights alert on `ValidationJobDeadLettered` custom event. ADMIN is notified within 1 minute of first DLQ entry.
