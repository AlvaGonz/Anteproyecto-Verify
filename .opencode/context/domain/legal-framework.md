# VeriFinca — Legal Framework

## Law 172-13 (Data Protection)

Key requirements for handling personal and financial data in the Dominican Republic.

### Consent Management
- Explicit consent required before processing financial/credit data
- Consent must be recorded immutably (INSERT only, no UPDATE)
- Consent text must include version tracking
- Developer can revoke consent (IsRevoked = true) — preserves audit trail
- Credit checks blocked unless consent is active and version matches

### Data Minimization
- Only collect data necessary for verification
- TransUnion credit reports: retain max 30 days after seal issuance
- Uploaded documents: retain max 90 days after project closure
- Purge job must run daily at 02:00 UTC

### Data Retention
| Data Type | Retention | Action |
|-----------|-----------|--------|
| TransUnion credit reports | 30 days post-seal | Hard-delete or anonymize ResponseJson |
| Uploaded documents | 90 days post-seal | Delete blob + mark [PURGED] |
| OCR raw output | 90 days | Set OcrResultJson = NULL |
| ConsentRecords | 7 years | Archive to cold storage |
| AuditLogs | 7 years | Archive to cold storage |
| Revoked refresh tokens | 7 days post-expiry | Hard-delete |

### Security Requirements
- AES-256 encryption at rest (TDE + Customer Key)
- TLS 1.2+ in transit
- BCrypt password hashing (cost factor 12)
- Always Encrypted for TransUnion ResponseJson column
- Column-level encryption for sensitive financial data

## Law 126-02 (Digital Commerce)

### Digital Signatures
- Integrity Seal signed with RSA-2048 via Key Vault
- QR code contains digital signature for public verification
- Public key published at `/.well-known/signing-key.pem`
- Signature covers: `SHA256(projectId + validationHash + issuedAt)`

### Electronic Evidence
- All audit logs are admissible as electronic evidence
- Logs are append-only with immutable timestamps
- Each event records: user, action, old/new values, IP, timestamp

## Enforcement Rules for Agents

1. **Never delete** ConsentRecords or AuditLogs — archive only after 7 years
2. **Never bypass** consent guard on credit check endpoints
3. **Always** emit audit events for auth, validation, seal, and consent operations
4. **Always** use Key Vault for secrets — never environment variables or config files
5. **Always** apply column-level encryption for TransUnion response data
6. **Never** retain financial data beyond its TTL
7. **Always** include correlationId in audit events for traceability
