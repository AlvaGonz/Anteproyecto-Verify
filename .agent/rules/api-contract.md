---
trigger: always_on
---

# API Contract Rules

Version: 1.0.0 | Scope: VeriFinca.Api + React 19 SPA | Anchor: TRD §9, §13.3

---

## 1. BASE URL & VERSIONING (ABSOLUTE)

- All routes are prefixed with `/v1`. No endpoint may be exposed without a version prefix.
- Breaking changes (field removal, type change, route rename, new required field) are **Type 1
  decisions** — they require explicit human approval before any code is written.
- A change is breaking if it affects any of: `POST /projects`, `POST /projects/{id}/seal`,
  `GET /public/verify/{sealId}`, or any endpoint consumed by an unauthenticated public client.
- Additive changes (new optional field, new endpoint) do not require a human gate but MUST be
  reflected in the TRD §9 table before committing implementation code.
  - verify: Run `grep -r "v2\|v3\|/api/[^v]" src/VeriFinca.Api/Controllers/` — must return 0 matches.

---

## 2. ERROR ENVELOPE — RFC 7807 (ZERO TOLERANCE)

Every non-2xx response from `VeriFinca.Api` MUST use this exact JSON structure.
No custom error shapes. No plain-text error responses. No stack traces in production.

```json
{
  "type": "https://verifinca.do/errors/{code}",
  "title": "Human-readable title",
  "status": 422,
  "detail": "Specific explanation of what failed and why",
  "traceId": "00-abc123def456-789xyz-01",
  "errors": { }
}
```

- `type` must be a stable URL slug — never a generic string.
- `traceId` must be the `Activity.TraceId` propagated from Application Insights.
- `errors` object is only populated for validation failures (field-level Zod/FluentValidation errors).
- `ErrorHandlingMiddleware` is the single enforcement point — never return error shapes from controllers directly.
  - verify: `grep -rn "return BadRequest\|return StatusCode\|new ObjectResult" src/VeriFinca.Api/Controllers/` must return 0 matches that contain raw string messages.

---

## 3. ZOD ↔ FLUENTVALIDATION SYNC (ENFORCED)

The Zod schema in the SPA is the **frontend contract mirror** of the backend FluentValidation validator.
They must stay in sync. Drift is an architectural violation.

Rules:
- Every `POST`/`PATCH` DTO in `VeriFinca.Application` must have:
  1. A `FluentValidation` validator class in `VeriFinca.Application/Validators/`.
  2. A matching Zod schema in `src/infrastructure/api/schemas/{domain}.schema.ts`.
- The following fields have exact sync requirements — deviation is a merge blocker:

| Field | FluentValidation Rule | Zod Rule |
|---|---|---|
| `RNC` | Regex `^\d{1}-\d{2}-\d{5}-\d{1}$` | `z.string().regex(/^\d{1}-\d{2}-\d{5}-\d{1}$/)` |
| `DeclaredAreaM2` | `GreaterThan(0)` | `z.number().positive()` |
| `LatitudeGPS` | `InclusiveBetween(-90, 90)` | `z.number().min(-90).max(90)` |
| `LongitudeGPS` | `InclusiveBetween(-180, 180)` | `z.number().min(-180).max(180)` |
| `ConsentVersion` | `NotEmpty()`, exact match to current template | `z.string().min(1)` |
| `DocumentType` | Enum whitelist | `z.enum([...DocumentType])` |

- verify: Any PR that modifies a `*Command.cs` or `*Validator.cs` in `VeriFinca.Application` MUST include
  a matching change to the corresponding `*.schema.ts` file. A PR that modifies only one side is rejected.

---

## 4. ZOD ↔ ER DIAGRAM SYNC

The Zod schemas in `src/infrastructure/api/schemas/` must mirror the Entity-Relationship diagram
defined in `ARCHITECTURE.md §7`. This is a **machine-readable contract**.

- `UNIQUEIDENTIFIER` columns → `z.string().uuid()`
- `NVARCHAR(N)` columns → `z.string().max(N)`
- `DECIMAL(18,2)` columns → `z.number()`
- `BIT` columns → `z.boolean()`
- `DATETIME2` columns in responses → `z.string().datetime()`
- Nullable columns → wrap with `.nullable()` — never `.optional()` for DB-origin fields.
  - verify: After any EF Core migration, run schema diff against Zod schemas.
    A new non-nullable column without a corresponding Zod `.min(1)` or required field is a violation.

---

## 5. ENDPOINT GUARDS — PRE-IMPLEMENTATION CHECKLIST

Before writing any new controller action, the following must exist first:

1. **TRD §9 entry** — method, route, role, RF reference, and guard conditions documented.
2. **FluentValidation class** — failing unit test must exist before the validator is written.
3. **`RbacAuthorizationFilter` role** — the role must be explicitly declared; no implicit public access.
4. **RFC 7807 error type slug** — defined in `VeriFinca.Api/Errors/ErrorCodes.cs` before use.

Forbidden patterns:
- `[AllowAnonymous]` on any route except `POST /auth/login`, `POST /auth/refresh`,
  and `GET /public/verify/{sealId}`.
- Controller actions that return data without going through a MediatR query.
- DTOs with `object` or `dynamic` typed fields — all fields must be strongly typed.

---

## 6. RATE LIMITING — PUBLIC ENDPOINTS

- `GET /public/verify/{sealId}` — 60 req/min per IP. Configured in `appsettings.json` via `RateLimitMiddleware`.
- No hardcoded rate limit values in middleware code. All limits are configuration-driven.
- Response on limit exceeded: `HTTP 429` with RFC 7807 body:
  ```json
  {
    "type": "https://verifinca.do/errors/rate-limit-exceeded",
    "title": "Too Many Requests",
    "status": 429,
    "detail": "Rate limit of 60 requests per minute exceeded for this IP.",
    "traceId": "..."
  }
  ```
  - verify: `grep -rn "new RateLimitMiddleware\|RateLimit(" src/VeriFinca.Api/` must show configuration-driven values only.

---

## 7. SEAL ENDPOINT GUARD (RF-10) — EXPLICIT VERIFICATION ORDER

`POST /projects/{id}/seal` must enforce guards **in this exact order** before calling `ISealingService`:

1. All `ValidationResults.Status` for the project = `PASS` → else `422 VALIDATIONINCOMPLETE`
2. No `Document.Status` in `{INVALID, MISSING}` → else `422 DOCUMENTSINVALID`
3. `ConsentRecord` exists AND `IsRevoked = false` → else `422 CONSENTREQUIRED`

An agent that reorders, skips, or combines these guards is producing a security defect.
The guard order maps directly to the Mermaid flowchart in `ARCHITECTURE.md §5`.

---

## 8. HTTP CLIENT — SPA LAYER

All API calls from the React SPA must go through the typed client layer in `src/infrastructure/api/`.
Direct `fetch()` or standalone `axios` calls in feature components are **forbidden**.

- `src/infrastructure/api/client.ts` — Axios instance, JWT interceptor, refresh logic.
- Every domain has its own typed file: `projects.api.ts`, `validations.api.ts`, `seals.api.ts`, `public.api.ts`.
- All TanStack Query `queryFn` and `mutationFn` must call these typed functions — never inline fetch.
  - verify: `grep -rn "fetch(\|axios\.get\|axios\.post" src/features/` must return 0 matches.

---

## 9. BREAKING CHANGE PROTOCOL — HUMAN GATE

The following changes require explicit human approval before any spec or code is produced:

- Removing or renaming a field from any existing response DTO.
- Changing an existing field's type (e.g., `string` → `number`).
- Adding a required field to an existing request DTO.
- Removing or renaming any route in TRD §9.
- Changing the error `type` slug for any existing error code.

**Trigger:** Agent must stop, output `[HUMAN GATE REQUIRED: API_BREAKING_CHANGE]`, and list the
exact field or route being changed. Do not proceed until approval is recorded in `docs/PWF/progress.md`.