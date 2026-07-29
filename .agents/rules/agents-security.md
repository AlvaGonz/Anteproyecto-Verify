---
name: Security & DevSecOps Rules
description: Applied when handling authentication, authorization, cryptography, secrets, or compliance with Law 172-13 and Law 126-02.
---

# Security Guardrails & DevSecOps (VeriFinca)

> **When to Use**: Apply these rules when modifying Auth logic, RBAC, Data Retention, Key Vault secrets, or interacting with sensitive data.

## Zero-Trust Principles
- **No Hallucinated Bypasses**: Never remove authentication guards, CORS policies, or input validation to "make it work."
- **Input Validation (OWASP)**: All data MUST be validated using Zod schemas (frontend) and FluentValidation (backend). Sanitize DB inputs (SQLi). Escape UI outputs (XSS).
- **Login Verification Guard (Gate 0)**: Never commit or save changes if the user login or authentication process is broken.

## Security Architecture Invariants (Non-negotiable)
1. **Never write raw SQL.** Use EF Core parameterized queries only (A03 – Injection).
2. **Never add secrets to `appsettings.json` or `.env`.** All secrets must be in Azure Key Vault (A02).
3. **Never bypass FluentValidation.** All DTOs must have a registered validator.
4. **Never issue IntegritySeal** unless all `ValidationResults.Status = PASS`, no `Document.Status ∈ {INVALID, MISSING}`, and `ConsentRecord.IsRevoked = false` (OE-7).
5. **Never delete `ConsentRecords` or `AuditLogs`** before the 7-year retention period (Law 172-13).
6. **Never query TransUnion** without an active, version-matched `ConsentRecord` (Law 172-13).
7. **Never expose stack traces** in production error responses.
8. **Never allow outbound HTTP** to non-whitelisted government API domains (SSRF).
9. **SHA-256 hash all uploaded documents** (`Documents.BlobSha256`).

## Role-Based Access Control (RBAC)
| Role | Scope |
|---|---|
| `ADMIN` | All modules + rule config + audit + requeue DLQ |
| `DEVELOPER` | Own projects: register, upload documents, grant consent, read validations |
| `VALIDATOR` | Trigger all validations, review results, approve seal |
| `PUBLIC` | RF-11 – QR seal lookup only (unauthenticated, rate-limited) |

## Secrets Management
**ALL secrets must be in Azure Key Vault.**
- `verifinca-jwt-secret`: JWT HMAC-SHA256 signing
- `verifinca-rsa-private-key`: Integrity Seal signing (Law 126-02 Art. 32)
- `verifinca-rsa-public-key`: Published at `/public/.well-known/signing-key.pem`
- `verifinca-ri-apikey`, `verifinca-transunion-apikey`, etc.: Government integrations.

## Security Headers
Applied by `SecurityHeadersMiddleware`:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: default-src 'self'`
