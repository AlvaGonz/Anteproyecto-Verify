# VeriFinca — Security Standards

## OWASP Top 10 Enforcement

| Risk | Mitigation |
|------|------------|
| A01 – Broken Access Control | RBAC per endpoint + IDOR tests |
| A02 – Cryptographic Failures | AES-256 TDE + TLS 1.2+ + BCrypt + RSA-2048 |
| A03 – Injection | FluentValidation + EF Core parameterized queries |
| A04 – Insecure Design | ADR required for all data-access patterns |
| A05 – Security Misconfiguration | Security headers middleware + no stack traces in prod |
| A06 – Vulnerable Components | dotnet-outdated scan + Dependabot |
| A07 – Auth & Session Failures | JWT + refresh rotation + 2FA for ADMIN/VALIDATOR |
| A08 – Software Integrity Failures | SHA-256 on all uploaded documents |
| A09 – Logging Failures | Structured logging on all auth + validation events |
| A10 – SSRF | Whitelist-only outbound HTTP + static base URLs |

## Security Headers (Mandatory Middleware)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

## Authentication & Authorization

### JWT Configuration
- Access token TTL: 1 hour
- Refresh token TTL: 30 days (single-use, rotated on each refresh)
- HMAC-SHA256 signing via Key Vault secret
- 2FA mandatory for ADMIN and VALIDATOR roles

### RBAC Roles
| Role | Permissions |
|------|-------------|
| ADMIN | All modules + rule config + audit + DLQ requeue |
| DEVELOPER | Own projects: register, upload, consent, read validations |
| VALIDATOR | Trigger validations, review results, approve seal |
| PUBLIC | QR seal lookup only (unauthenticated, rate-limited 60 req/min) |

## Input Validation

- All DTOs validated via FluentValidation before handler execution
- File uploads: MIME whitelist (pdf, jpeg, png), max 20 MB
- MIME validation: `application/pdf`, `image/jpeg`, `image/png`
- RNC regex: `/^\d{1}-\d{2}-\d{5}-\d{1}$/`
- GPS: latitude ∈ [-90, 90], longitude ∈ [-180, 180]
- Virus scan: Azure Defender for Storage on blob write

## Secret Management

- Zero secrets in appsettings.json, .env, or source code
- All secrets in Azure Key Vault, accessed via Managed Identity
- Secrets cached in IMemoryCache with 5-minute TTL
- Key Vault secrets: JWT secret, RSA key pair, DB connection string,
  Service Bus connection string, all API keys, Redis connection string

## Data Protection

| Data Type | Protection |
|-----------|------------|
| Passwords | BCrypt (cost factor 12) |
| JWT | HMAC-SHA256 |
| SQL at rest | AES-256 via TDE + Customer Key |
| Blob at rest | AES-256 via SSE + Customer Key |
| In transit | TLS 1.2+ enforced |
| TransUnion data | Always Encrypted column |
