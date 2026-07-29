---
name: Real Estate Domain Rules
description: Applied when working with real estate verification, property documentation, or Dominican Republic legal compliance.
---

# Real Estate & Thesis Objectives (VeriFinca)

> **When to Use**: Apply these rules when modifying domain entities (`Project`, `Document`, `ValidationResult`, `ConsentRecord`, `IntegritySeal`) or any code related to the 7 thesis objectives (OE-1 to OE-7).

## Thesis Objectives (OE) Mapping

Every feature must map to at least one of these objectives:
- **OE-1**: Diagnose essential documents based on RI regulations.
- **OE-2**: Automate validation via DGII, Catastro, RI APIs.
- **OE-3**: Detect registry/documentary duplicities.
- **OE-4**: Detect document inconsistencies (risk alerts).
- **OE-5**: Validate territorial correspondence via georeferencing.
- **OE-6**: Verify developer financial/credit status (Law 172-13).
- **OE-7**: Certify integrity via Digital Seal + QR + digital signature (Law 126-02).

## Core Data Schema & Retention

| Table | Purpose | Retention | Purge Action |
|---|---|---|---|
| `Projects` | Real estate metadata (RNC, Matricula, GPS) | Indefinite | - |
| `Documents` | Uploaded PDFs/images + OCR results | 90 days post-seal | Delete blob + OcrResultJson = NULL |
| `ValidationResults` | Results from RI, DGII, Catastro, TransUnion | 30 days (TransUnion) | Hard-delete or anonymize |
| `ConsentRecords` | Law 172-13 consent, immutable insert | 7 years | Archive to cold storage |
| `IntegritySeals` | RSA-2048 signed seals (Law 126-02) | Indefinite | - |
| `AuditLogs` | User actions with IP + old/new values | 7 years | Archive to cold storage |

## External Integrations

All external integrations must be decoupled via **Azure Service Bus** (`verifinca-validation-jobs`) with Polly retries.

| Integration | RF | Auth | Fallback |
|---|---|---|---|
| Azure AI Document Intelligence | RF-3 | Managed Identity | prebuilt-document model |
| Registro Inmobiliario (RI) | RF-4 | API Key from KV | Status: FALLBACK, 3x retry |
| Catastro Nacional | RF-5 | API Key from KV | Status: FALLBACK, 3x retry |
| DGII RNC validation | RF-6 | Public REST | Cached 48h; retry on timeout |
| TransUnion DR | RF-9 | API Key from KV | Blocked unless consent active |

## Human Gate Triggers (Domain)

Stop and ask for human approval for:
- Any EF Core migration (Schema change is irreversible).
- Any change to `ConsentRecords` (Law 172-13 compliance).
- Any change to `IntegritySeals` or `CertificationEngine` (Law 126-02 compliance).
- Any new external API integration (RI, DGII, Catastro, TransUnion).
- Any purge job modifying `ConsentRecords` or `AuditLogs` (7-year retention).
