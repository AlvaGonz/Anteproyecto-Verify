# VeriFinca — Domain Overview

## Project Purpose

VeriFinca is an integrated web system for verifying and authenticating real estate projects in the Dominican Republic. Its primary mission is to prevent financial fraud by validating legal, financial, and property documentation through automated cross-referencing with official government sources and credit bureaus.

## Core Value Proposition

Reducing the manual verification process from **5–15 days to ~2 minutes** through a unified digital platform.

## Key Stakeholders

| Stakeholder | Role |
|-------------|------|
| Real Estate Developers | Register projects, upload documents, grant consent |
| Validators/Notaries | Trigger validations, review results, approve seals |
| Investors/Buyers | Verify project legitimacy via QR code |
| Platform Admins | Manage rules, users, monitor system |
| Government Bodies | RI, DGII, Catastro Nacional (data sources) |

## System Modules

| Module | Description |
|--------|-------------|
| Document Rules Engine | Evaluates document validity and completeness |
| OCR Pipeline | Azure AI Document Intelligence for field extraction |
| Government API Gateway | RI (titles), Catastro (cadastre), DGII (tax) |
| Georeferencing Module | Validates territorial data against cadastre |
| Consent Manager | Handles legal permissions (Law 172-13) |
| Certification Engine | Issues Digital Integrity Seal (Law 126-02) |
| Credit Check Gateway | TransUnion integration (consent-gated) |

## Core Workflow

```
Developer registers project → Uploads documents → OCR extracts fields →
RI query (title/ownership) → Catastro contrast (area/boundaries) →
DGII check (tax compliance) → Consent → Credit check →
All pass? → Issue Digital Integrity Seal → Public QR verification
```

## Technology Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** ASP.NET Core 8 (Clean Architecture + CQRS/MediatR)
- **Database:** Azure SQL (TDE + Customer Key)
- **Storage:** Azure Blob Storage (SSE + Customer Key)
- **Messaging:** Azure Service Bus (async validation jobs)
- **AI:** Azure AI Document Intelligence (OCR)
- **Secrets:** Azure Key Vault (Managed Identity)
- **Cache:** Azure Cache for Redis (idempotency + public seal cache)
- **Observability:** Application Insights + Serilog
- **CI/CD:** GitHub Actions (12-stage pipeline)

## Reference Documents

- `PRD_VeriFinca.md` — Product Requirements
- `TRD_VeriFinca.md` — Technical Requirements
- `ARCHITECTURE.md` — C4 diagrams + ERD
- `AGENTS.md` — Agent constitution and protocols
- `DESIGN.md` — UI design system and tokens
