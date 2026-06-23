# VeriFinca — Async Validation Pipeline Process

## Overview

The validation pipeline decouples all OCR and government API checks from the HTTP request cycle via Azure Service Bus. No long-running external call may block an HTTP response.

## Pipeline Steps

### 1. Trigger (HTTP)
- `POST /projects/{id}/validations/trigger` → Validator role
- Validates all required documents exist
- Enqueues `ValidationJobMessage` to Service Bus
- Returns `202 Accepted { jobId, pollUrl }`

### 2. OCR (Azure AI Document Intelligence)
- AnalyzeDocument for each uploaded document
- Extract required fields per document type
- Fields with Confidence < 0.85 → alert code `DOC_INCOMPLETE_FIELDS`
- SHA-256 hash check for duplicate detection (`DOC_DUPLICATE`)
- Store result as ValidationResult (source: OCR, status: PASS/FAIL)

### 3. RI Query
- GET /property/{matricula}
- Validates title, ownership, legal encumbrances
- 3x retry → circuit breaker → FALLBACK status
- Store result as ValidationResult (source: RI)

### 4. Catastro Contrast
- GET /designation/{cadastralId}
- Compare declared area vs cadastre record
- Same retry/fallback pattern as RI
- Store result as ValidationResult (source: CATASTRO)

### 5. DGII Tax Check
- GET /rnc/{rnc} (public API)
- Verify fiscal status and tax compliance
- Cache: 48h if PASS
- Store result as ValidationResult (source: DGII)

### 6. Geolocation Validation
- Verify GPS coordinates match cadastre boundary
- Ensure project location is within permitted zones
- Store result as ValidationResult (source: GEOLOCATION)

### 7. Credit Check (Consent-Gated)
- Only if ConsentRecord.IsRevoked = false
- POST /credit-report to TransUnion
- Idempotency cache to prevent double-charging
- Store result as ValidationResult (source: TRANSUNION)

### 8. Completion
- Update Projects.ValidationStatus = COMPLETE or FAILED
- Complete Service Bus message
- Emit Application Insights custom event

## Error Handling

| Scenario | Behavior |
|----------|----------|
| API timeout (15s) | Retry (3x exponential) |
| API unavailable | Circuit breaker (5 failures → 30s open) |
| All retries failed | FALLBACK status + ADMIN notification |
| Message delivery > 3 | Dead-letter queue |
| Consent revoked mid-flow | Skip/skip TransUnion step |

## Idempotency

All paid external API calls (TransUnion, RI) use Redis idempotency cache:
- Key: `idempotency:{clientName}:{SHA256(projectId + rnc + requestType)}`
- TTL: 24 hours
- Hit → return cached response (no charge)
- Miss → call API → cache response → proceed
