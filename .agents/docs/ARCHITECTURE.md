# ARCHITECTURE.md — VeriFinca

> **Version:** 1.0.0 | **Date:** 2026-05-25 | **Status:** Active
> **Maintainer Rule:** Every agent that alters data flow, service interaction, or schema **MUST** update the diagrams in this file before committing implementation code.
> **Related:** `TRD_VeriFinca.md` · `AGENTS.md` · `ADR/`

---

## Table of Contents

1. [C4 Level 1 — System Context](#1-c4-level-1--system-context)
2. [C4 Level 2 — Container Diagram](#2-c4-level-2--container-diagram)
3. [C4 Level 3 — Component Diagram (API + Application)](#3-c4-level-3--component-diagram-api--application)
4. [Async Validation Flow — Sequence Diagram](#4-async-validation-flow--sequence-diagram)
5. [Seal Issuance Flow — Sequence Diagram](#5-seal-issuance-flow--sequence-diagram)
6. [Consent & Credit Check Guard Flow](#6-consent--credit-check-guard-flow)
7. [Entity-Relationship Diagram (Core Schema)](#7-entity-relationship-diagram-core-schema)
8. [Clean Architecture Dependency Rules](#8-clean-architecture-dependency-rules)
9. [CI/CD Pipeline Flow](#9-cicd-pipeline-flow)
10. [Infrastructure Topology](#10-infrastructure-topology)

---

## 1. C4 Level 1 — System Context

> **Who** uses VeriFinca and **what external systems** does it interact with.

```mermaid
C4Context
  title VeriFinca — System Context (C4 Level 1)

  Person(developer, "Developer / Promoter", "Registers real estate projects, uploads legal documents, grants consent")
  Person(validator, "DGII Validator / Notary", "Triggers validation pipeline, reviews results, approves integrity seal")
  Person(admin, "Platform Admin", "Manages rules, roles, requeues failed jobs, monitors system")
  Person(public, "General Public", "Scans QR code to verify a property integrity seal (unauthenticated)")

  System(verifinca, "VeriFinca Platform", "Validates legal and financial integrity of real estate projects in the Dominican Republic. Issues tamper-proof digital seals.")

  System_Ext(ri, "Registro Inmobiliario (RI)", "Official land title registry — REST/SOAP")
  System_Ext(catastro, "Catastro Nacional", "Cadastral data and land surveys — REST")
  System_Ext(dgii, "DGII", "Tax compliance and RNC verification — REST public API")
  System_Ext(transunion, "TransUnion DR", "Credit profile and financial risk — REST/SOAP")
  System_Ext(docai, "Azure AI Document Intelligence", "OCR + field extraction on uploaded PDFs/images")
  System_Ext(email, "Resend / SMTP", "Transactional email notifications")

  Rel(developer, verifinca, "Registers projects, uploads documents, grants consent", "HTTPS/React SPA")
  Rel(validator, verifinca, "Triggers validations, reviews results, approves seal", "HTTPS/React SPA")
  Rel(admin, verifinca, "Manages configuration and monitors jobs", "HTTPS/React SPA")
  Rel(public, verifinca, "Verifies seal via QR code", "HTTPS – unauthenticated")

  Rel(verifinca, ri, "Queries title and ownership records", "HTTPS REST/SOAP + API Key")
  Rel(verifinca, catastro, "Queries cadastral designation and area", "HTTPS REST + API Key")
  Rel(verifinca, dgii, "Queries RNC and tax compliance status", "HTTPS REST – public")
  Rel(verifinca, transunion, "Queries credit risk profile (consent-gated)", "HTTPS REST/SOAP + API Key")
  Rel(verifinca, docai, "Sends document blobs for OCR analysis", "HTTPS REST SDK – Managed Identity")
  Rel(verifinca, email, "Sends validation status and seal notifications", "HTTPS REST + API Key")
```

---

## 2. C4 Level 2 — Container Diagram

> **What deployable units** make up VeriFinca and how they communicate.

```mermaid
C4Container
  title VeriFinca — Container Diagram (C4 Level 2)

  Person(developer, "Developer")
  Person(validator, "Validator")
  Person(admin, "Admin")
  Person(public, "Public User")

  System_Boundary(verifinca, "VeriFinca Platform") {
    Container(spa, "React 19 SPA", "TypeScript + Vite", "Single-page application hosted on Azure Static Web Apps. All UI for DEVELOPER, VALIDATOR, ADMIN roles.")
    Container(api, "VeriFinca.Api", "ASP.NET Core 8", "REST API exposing all business operations. JWT auth. Rate-limited public endpoints. Hosted on Azure App Service.")
    Container(worker, "ValidationJobConsumer", "IHostedService (.NET 8)", "Background worker subscribed to Azure Service Bus. Executes OCR + government API calls asynchronously.")
    ContainerDb(sqldb, "Azure SQL Database", "SQL Server (Azure)", "All relational data: projects, documents, validations, consents, seals, audit logs. TDE + customer-managed key.")
    ContainerDb(blob, "Azure Blob Storage", "Azure Storage", "Uploaded documents (PDF/image) and issued seal PDFs. SSE + customer-managed key. Versioning enabled.")
    Container(bus, "Azure Service Bus", "Azure Service Bus (Standard)", "Queue: verifinca-validation-jobs. Max delivery: 3. DLQ enabled. Decouples upload from async validation.")
    Container(keyvault, "Azure Key Vault", "Azure Key Vault (Standard)", "All secrets, RSA-2048 signing key pair, AES-256 customer keys for SQL + Blob. Accessed via Managed Identity.")
    Container(insights, "Application Insights", "Azure Monitor", "Structured logs, distributed traces, custom events, DLQ alerts, p95 latency alerts.")
  }

  System_Ext(ri, "Registro Inmobiliario")
  System_Ext(catastro, "Catastro Nacional")
  System_Ext(dgii, "DGII")
  System_Ext(transunion, "TransUnion DR")
  System_Ext(docai, "Azure AI Document Intelligence")

  Rel(developer, spa, "Uses", "HTTPS browser")
  Rel(validator, spa, "Uses", "HTTPS browser")
  Rel(admin, spa, "Uses", "HTTPS browser")
  Rel(public, api, "GET /public/verify/{sealId}", "HTTPS – unauthenticated, rate-limited")

  Rel(spa, api, "REST API calls", "HTTPS + Bearer JWT")
  Rel(api, sqldb, "Reads/Writes via EF Core", "TCP 1433 – TLS")
  Rel(api, blob, "Uploads documents, reads seal PDFs", "HTTPS – Managed Identity")
  Rel(api, bus, "Enqueues ValidationJobMessage", "AMQP – Managed Identity")
  Rel(api, keyvault, "Reads JWT secret, connection strings", "HTTPS – Managed Identity")
  Rel(api, insights, "Emits structured logs + traces", "HTTPS SDK")

  Rel(worker, bus, "Dequeues and completes/DLQ messages", "AMQP – Managed Identity")
  Rel(worker, sqldb, "Reads project data, writes ValidationResults", "TCP 1433 – TLS")
  Rel(worker, docai, "POST AnalyzeDocument", "HTTPS SDK – Managed Identity")
  Rel(worker, ri, "GET /property/{matricula}", "HTTPS REST/SOAP")
  Rel(worker, catastro, "GET /designation/{id}", "HTTPS REST")
  Rel(worker, dgii, "GET /rnc/{rnc}", "HTTPS REST")
  Rel(worker, transunion, "POST /credit-report", "HTTPS REST/SOAP")
  Rel(worker, keyvault, "Reads external API keys", "HTTPS – Managed Identity")
  Rel(worker, insights, "Emits validation events + DLQ alerts", "HTTPS SDK")
```

---

## 3. C4 Level 3 — Component Diagram (API + Application)

> **How responsibilities are split** inside the API and Application layers.

```mermaid
C4Component
  title VeriFinca.Api + VeriFinca.Application — Component Diagram (C4 Level 3)

  Container_Boundary(api, "VeriFinca.Api") {
    Component(authCtrl, "AuthController", "ASP.NET Controller", "POST /auth/login · POST /auth/refresh · POST /auth/logout")
    Component(projCtrl, "ProjectsController", "ASP.NET Controller", "POST /projects · GET /projects/{id} · GET /projects/{id}/documents/diagnosis")
    Component(valCtrl, "ValidationController", "ASP.NET Controller", "POST /validations/trigger · GET /validations · POST /consent · POST /validations/credit · POST /seal")
    Component(pubCtrl, "PublicController", "ASP.NET Controller", "GET /public/verify/{sealId} — unauthenticated, 60 req/min IP rate limit")
    Component(rbacFilter, "RbacAuthorizationFilter", "Action Filter", "Enforces ADMIN/DEVELOPER/VALIDATOR/PUBLIC role policy per endpoint")
    Component(errMiddleware, "ErrorHandlingMiddleware", "ASP.NET Middleware", "Catches all unhandled exceptions. Returns RFC 7807 problem details. No stack traces in production.")
    Component(secHeaders, "SecurityHeadersMiddleware", "ASP.NET Middleware", "Injects HSTS, X-Frame-Options, CSP, nosniff, Permissions-Policy on every response")
    Component(rateLimit, "RateLimitMiddleware", "ASP.NET Middleware", "Per-IP rate limiting on /public endpoints. Configurable via appsettings.")
  }

  Container_Boundary(app, "VeriFinca.Application") {
    Component(registerCmd, "RegisterProjectCommand + Handler", "MediatR Command", "Validates DTO (FluentValidation) → creates Project entity → persists via IProjectRepository")
    Component(uploadCmd, "UploadDocumentCommand + Handler", "MediatR Command", "Validates MIME + size → uploads to Blob → persists Document record → triggers Rules Engine diagnosis")
    Component(triggerCmd, "TriggerValidationCommand + Handler", "MediatR Command", "Validates all documents exist → enqueues ValidationJobMessage to Service Bus → returns jobId")
    Component(consentCmd, "RecordConsentCommand + Handler", "MediatR Command", "Validates consent version → inserts immutable ConsentRecord → blocks if already active")
    Component(sealCmd, "IssueIntegritySealCommand + Handler", "MediatR Command", "Guards: all PASS + consent active + no INVALID docs → calls ISealingService → persists IntegritySeal")
    Component(diagQuery, "GetDocumentDiagnosisQuery + Handler", "MediatR Query", "Runs Rules Engine across all project documents → returns missing/invalid document list with codes")
    Component(valQuery, "GetValidationResultsQuery + Handler", "MediatR Query", "Reads ValidationResults from DB → returns aggregated status per source")
    Component(validators, "FluentValidation Validators", "Validation Pipeline", "One validator class per DTO. All registered in DI pipeline via Assembly scan. Runs before every handler.")
  }

  Rel(authCtrl, app, "Dispatches commands via MediatR", "In-process")
  Rel(projCtrl, registerCmd, "IMediator.Send(RegisterProjectCommand)", "In-process")
  Rel(projCtrl, diagQuery, "IMediator.Send(GetDocumentDiagnosisQuery)", "In-process")
  Rel(valCtrl, triggerCmd, "IMediator.Send(TriggerValidationCommand)", "In-process")
  Rel(valCtrl, consentCmd, "IMediator.Send(RecordConsentCommand)", "In-process")
  Rel(valCtrl, sealCmd, "IMediator.Send(IssueIntegritySealCommand)", "In-process")
  Rel(valCtrl, valQuery, "IMediator.Send(GetValidationResultsQuery)", "In-process")
  Rel(rbacFilter, authCtrl, "Applied globally via filter pipeline", "ASP.NET filter chain")
  Rel(errMiddleware, authCtrl, "Wraps entire request pipeline", "ASP.NET middleware chain")
  Rel(validators, registerCmd, "Validates before handler executes", "MediatR pipeline behavior")
```

---

## 4. Async Validation Flow — Sequence Diagram

> **RF-3 → RF-7:** How a validation job travels from HTTP trigger to stored results.

```mermaid
sequenceDiagram
  autonumber
  actor Validator
  participant API as VeriFinca.Api<br/>(ValidationController)
  participant Bus as Azure Service Bus<br/>(verifinca-validation-jobs)
  participant Worker as ValidationJobConsumer<br/>(IHostedService)
  participant KV as Azure Key Vault
  participant DocAI as Azure AI Document Intelligence<br/>(RF-3 OCR)
  participant RI as Registro Inmobiliario<br/>(RF-4)
  participant Cat as Catastro Nacional<br/>(RF-5)
  participant DGII as DGII<br/>(RF-6)
  participant TU as TransUnion DR<br/>(RF-9 — consent-gated)
  participant DB as Azure SQL

  Validator->>API: POST /projects/{id}/validations/trigger
  API->>API: Validate JWT + VALIDATOR role (RbacFilter)
  API->>API: Verify all required Documents exist (Rules Engine)
  API->>Bus: Enqueue ValidationJobMessage { projectId, steps[], correlationId }
  API-->>Validator: 202 Accepted { jobId, pollUrl: GET /validations }

  Note over Bus,Worker: Azure Service Bus decouples HTTP from long-running work

  Bus->>Worker: Dequeue message (lock: 5 min)
  Worker->>KV: Get verifinca-docai-key (cache 5 min)
  Worker->>DocAI: AnalyzeDocumentAsync(modelId, blobUrl) per document
  DocAI-->>Worker: OcrResultDto { fields[], confidence[] }
  Worker->>DB: Upsert ValidationResult { source: OCR, status: PASS|FAIL }

  Worker->>KV: Get verifinca-ri-apikey
  Worker->>RI: GET /property/{matricula}
  alt RI responds
    RI-->>Worker: PropertyRecord
    Worker->>DB: Upsert ValidationResult { source: RI, status: PASS|FAIL }
  else RI unavailable (3x retry + circuit breaker)
    Worker->>DB: Upsert ValidationResult { source: RI, status: FALLBACK }
  end

  Worker->>Cat: GET /designation/{cadastralId}
  Note right of Cat: Same retry/fallback pattern as RI

  Worker->>DGII: GET /rnc/{rnc} (public — no key)
  Note right of DGII: Cached 48h if PASS

  opt ConsentRecord.IsRevoked = false (RF-9)
    Worker->>KV: Get verifinca-transunion-apikey
    Worker->>TU: POST /credit-report { rnc }
    TU-->>Worker: CreditProfileDto
    Worker->>DB: Upsert ValidationResult { source: TRANSUNION, status: PASS|FAIL }
  end

  Worker->>Bus: Complete message (remove from queue)
  Worker->>DB: Update Projects.ValidationStatus = COMPLETE|FAILED

  Validator->>API: GET /projects/{id}/validations (polling)
  API->>DB: SELECT ValidationResults WHERE projectId
  API-->>Validator: 200 { results[], overallStatus }
```

---

## 5. Seal Issuance Flow — Sequence Diagram

> **RF-10:** How an integrity seal is issued after all validations pass.

```mermaid
sequenceDiagram
  autonumber
  actor Admin
  participant API as VeriFinca.Api
  participant Handler as IssueIntegritySealCommand Handler
  participant DB as Azure SQL
  participant KV as Azure Key Vault
  participant Seal as CertificationEngine<br/>(Infrastructure/Sealing)
  participant Blob as Azure Blob Storage

  Admin->>API: POST /projects/{id}/seal
  API->>API: JWT + ADMIN role guard

  API->>Handler: IMediator.Send(IssueIntegritySealCommand)

  Handler->>DB: SELECT ValidationResults WHERE projectId
  alt Any status ≠ PASS
    Handler-->>API: DomainException(VALIDATION_INCOMPLETE)
    API-->>Admin: 422 { type: VALIDATION_INCOMPLETE }
  end

  Handler->>DB: SELECT Documents WHERE projectId AND status IN (INVALID, MISSING)
  alt Invalid/missing documents found
    Handler-->>API: DomainException(DOCUMENTS_INVALID)
    API-->>Admin: 422 { type: DOCUMENTS_INVALID }
  end

  Handler->>DB: SELECT ConsentRecord WHERE projectId AND IsRevoked = false
  alt No active consent
    Handler-->>API: ConsentRequiredException
    API-->>Admin: 422 { type: CONSENT_REQUIRED }
  end

  Handler->>KV: Get verifinca-rsa-private-key (RSA-2048)
  Handler->>Seal: SignPayload(projectId, validationHash, issuedAt, RSA key)
  Seal-->>Handler: SealPayload { sealId, signature, publicKeyThumbprint }

  Handler->>Blob: Upload seal PDF to /seals/{sealId}.pdf
  Handler->>DB: INSERT IntegritySeals { sealId, projectId, signature, ... }
  Handler->>DB: UPDATE Projects SET SealId = sealId, ValidationStatus = SEALED

  Handler-->>API: IntegritySealDto { sealId, qrUrl, sealPdfUrl }
  API-->>Admin: 201 Created { sealId, qrUrl, sealPdfUrl }
```

---

## 6. Consent & Credit Check Guard Flow

> **RF-8 + RF-9 (Law 172-13):** How consent is recorded and how the credit check is gated.

```mermaid
flowchart TD
  A([DEVELOPER: POST /projects/id/consent]) --> B{Active ConsentRecord\nexists AND IsRevoked = false?}
  B -- Yes --> C[422 CONSENT_ALREADY_ACTIVE]
  B -- No --> D{ConsentVersion =\nCurrentTemplateVersion?}
  D -- No --> E[422 CONSENT_VERSION_MISMATCH\nReturn latest template URL]
  D -- Yes --> F[INSERT ConsentRecord\nimmutable – no UPDATE ever]
  F --> G([200 OK – consent recorded])

  H([VALIDATOR: POST /projects/id/validations/credit]) --> I{ConsentRecord exists\nAND IsRevoked = false\nAND ConsentVersion matches?}
  I -- No --> J[403 CONSENT_REQUIRED\nBlock credit check]
  I -- Yes --> K[Enqueue credit check step\nto Service Bus]
  K --> L([202 Accepted])

  M([DEVELOPER: DELETE /projects/id/consent]) --> N[SET ConsentRecord.IsRevoked = true\nDo NOT delete row – preserve audit trail]
  N --> O{Pending credit job\nin Service Bus?}
  O -- Yes --> P[Cancel / skip TRANSUNION step\nin ValidationJobConsumer]
  O -- No --> Q([200 OK – consent revoked])
  P --> Q
```

---

## 7. Entity-Relationship Diagram (Core Schema)

> Matches `AppDbContext` exactly. **Sync check:** Zod schemas in the SPA must match this ERD.

```mermaid
erDiagram
  Users {
    UNIQUEIDENTIFIER Id PK
    NVARCHAR256 Email UK
    NVARCHAR256 PasswordHash
    NVARCHAR20 Role
    DATETIME2 CreatedAt
    BIT IsActive
  }

  Projects {
    UNIQUEIDENTIFIER Id PK
    UNIQUEIDENTIFIER OwnerId FK
    NVARCHAR256 Name
    NVARCHAR20 Type
    NVARCHAR11 RNC
    NVARCHAR50 Matricula UK
    NVARCHAR100 CadastralDesignation
    DECIMAL18_2 DeclaredAreaM2
    DECIMAL9_6 LatitudeGPS
    DECIMAL9_6 LongitudeGPS
    NVARCHAR20 ValidationStatus
    UNIQUEIDENTIFIER SealId FK
    DATETIME2 CreatedAt
  }

  Documents {
    UNIQUEIDENTIFIER Id PK
    UNIQUEIDENTIFIER ProjectId FK
    NVARCHAR20 Type
    NVARCHAR500 BlobUrl
    NVARCHAR64 BlobSha256
    NVARCHAR20 Status
    NVARCHARMAX OcrResultJson
    DATETIME2 UploadedAt
  }

  ValidationResults {
    UNIQUEIDENTIFIER Id PK
    UNIQUEIDENTIFIER ProjectId FK
    NVARCHAR20 Source
    NVARCHAR20 Status
    NVARCHARMAX ResponseJson
    DATETIME2 CachedUntil
    DATETIME2 ExecutedAt
  }

  ConsentRecords {
    UNIQUEIDENTIFIER Id PK
    UNIQUEIDENTIFIER ProjectId FK
    UNIQUEIDENTIFIER DeveloperId FK
    NVARCHARMAX ConsentText
    NVARCHAR10 ConsentVersion
    NVARCHAR45 IpAddress
    DATETIME2 AcceptedAt
    BIT IsRevoked
  }

  IntegritySeals {
    UNIQUEIDENTIFIER Id PK
    UNIQUEIDENTIFIER ProjectId FK
    NVARCHAR500 Signature
    NVARCHAR64 PublicKeyThumbprint
    NVARCHAR500 QrCodeUrl
    NVARCHAR500 SealPdfUrl
    DATETIME2 IssuedAt
    UNIQUEIDENTIFIER IssuedBy FK
  }

  AuditLogs {
    UNIQUEIDENTIFIER Id PK
    UNIQUEIDENTIFIER UserId FK
    UNIQUEIDENTIFIER ProjectId FK
    NVARCHAR100 Action
    NVARCHARMAX OldValue
    NVARCHARMAX NewValue
    NVARCHAR45 IpAddress
    DATETIME2 CreatedAt
  }

  Users ||--o{ Projects : "owns"
  Projects ||--o{ Documents : "has"
  Projects ||--o{ ValidationResults : "has"
  Projects ||--o{ ConsentRecords : "has"
  Projects ||--|| IntegritySeals : "sealed by"
  Users ||--o{ ConsentRecords : "granted by"
  Users ||--o{ AuditLogs : "performed by"
  Projects ||--o{ AuditLogs : "subject of"
```

---

## 8. Clean Architecture Dependency Rules

> Enforced at CI via `dotnet-archunit`. **Zero violations = merge gate.**

```mermaid
flowchart LR
  subgraph Allowed["✅ Allowed Dependencies"]
    direction TB
    A1[VeriFinca.Api] -->|MediatR dispatches only| A2[VeriFinca.Application]
    A2 -->|Domain types only| A3[VeriFinca.Domain]
    A4[VeriFinca.Infrastructure] -->|Implements interfaces| A2
    A4 -->|Uses entities| A3
  end

  subgraph Forbidden["🚫 Forbidden Dependencies (archunit violations = CI fail)"]
    direction TB
    F1[VeriFinca.Api] -.->|NEVER| F2[VeriFinca.Infrastructure]
    F3[VeriFinca.Api] -.->|NEVER direct| F4[VeriFinca.Domain]
    F5[VeriFinca.Application] -.->|NEVER| F6[VeriFinca.Infrastructure]
    F7[VeriFinca.Domain] -.->|NEVER| F8[Any other layer]
  end
```

**Dependency Injection wiring:** All interface-to-implementation bindings live in `VeriFinca.Infrastructure/DependencyInjection.cs` and are registered in `Program.cs` via `builder.Services.AddInfrastructure(builder.Configuration)`. The `Api` layer never instantiates Infrastructure types directly.

---

## 9. CI/CD Pipeline Flow

```mermaid
flowchart TD
  A([git push / PR opened]) --> B[dotnet build]
  B --> C{Build errors?}
  C -- Yes --> FAIL1([❌ Block merge])
  C -- No --> D[dotnet test – Unit\nxUnit + Moq]
  D --> E{Coverage ≥80%\non Domain+Application?}
  E -- No --> FAIL2([❌ Block merge])
  E -- Yes --> F[dotnet test – Integration\nTestContainers + WireMock.NET]
  F --> G{Any failures?}
  G -- Yes --> FAIL3([❌ Block merge])
  G -- No --> H[SonarCloud scan]
  H --> I{Critical/Blocker issues?}
  I -- Yes --> FAIL4([❌ Block merge])
  I -- No --> J[dotnet-archunit\nClean Architecture check]
  J --> K{Layer violations?}
  K -- Yes --> FAIL5([❌ Block merge])
  K -- No --> L[dotnet-outdated\nCVE check]
  L --> M[GitHub Advanced Security\nSecret scan on diff]
  M --> N{Secrets found?}
  N -- Yes --> FAIL6([❌ Block merge])
  N -- No --> O[Docker build + push to ACR]
  O --> P[Deploy to staging slot]
  P --> Q[OWASP ZAP headless scan\non staging]
  Q --> R{High-severity findings?}
  R -- Yes --> FAIL7([❌ Block merge])
  R -- No --> S[Smoke test: GET /health → 200]
  S --> T{Health check passes?}
  T -- No --> FAIL8([❌ Rollback])
  T -- Yes --> U([✅ Slot swap → Production])
```

---

## 10. Infrastructure Topology

```mermaid
flowchart TB
  subgraph Azure["Azure Cloud (East US 2)"]
    subgraph Network["Virtual Network / Private Endpoints"]
      SWA["Azure Static Web Apps\n(React 19 SPA)\nGlobal CDN"]
      APP["Azure App Service\n(VeriFinca.Api)\nASP.NET Core 8 – Standard S2"]
      SQL["Azure SQL Database\nGeneral Purpose 2 vCores\nTDE + Customer Key"]
      BLOB["Azure Blob Storage\nLRS + Versioning\nSSE + Customer Key"]
      SB["Azure Service Bus\nStandard Tier\nQueue: verifinca-validation-jobs\nDLQ enabled"]
      KV["Azure Key Vault\nStandard Tier\nRSA-2048 + AES-256 keys\n9 secrets"]
      AI["Application Insights\n+ Log Analytics Workspace\nRetention: 90 days"]
      ADS["Azure Defender for Storage\nMalware scan on blob write"]
    end

    ACR["Azure Container Registry\nDocker image store"]
    GHA["GitHub Actions\nCI/CD Pipeline\n(12-step gate)"]
  end

  subgraph External["External Systems"]
    RI["Registro Inmobiliario"]
    CAT["Catastro Nacional"]
    DGII_EXT["DGII"]
    TU["TransUnion DR"]
    DOCAI_EXT["Azure AI Document Intelligence\n(Cognitive Services)"]
  end

  Browser["Browser Client\n(HTTPS)"] --> SWA
  SWA --> APP
  APP --> SQL
  APP --> BLOB
  APP --> SB
  APP --> KV
  APP --> AI
  SB --> APP
  BLOB --> ADS
  APP --> RI
  APP --> CAT
  APP --> DGII_EXT
  APP --> TU
  APP --> DOCAI_EXT
  GHA --> ACR
  ACR --> APP
```

---

## Diagram Update Protocol

Any agent (Architect, Coder, Reviewer) that performs one of the following actions **must update the relevant diagram in this file in the same commit** — no exceptions:

| Change Type | Diagrams to Update |
|---|---|
| New external API integration | C4 Level 1, C4 Level 2, §10 Infrastructure Topology |
| New Service Bus message type or queue | §4 Async Validation Flow |
| New domain entity or relationship | §7 ERD |
| New API endpoint | C4 Level 3 Component Diagram |
| New Application layer command/query | C4 Level 3 Component Diagram |
| New business rule guard | §5 or §6 Sequence/Flowchart |
| New Azure resource | §10 Infrastructure Topology |
| Change to CI/CD gates | §9 CI/CD Pipeline Flow |

---

*ADR cross-references: `ADR/ADR-001-service-bus-async-validation.md` · `ADR/ADR-002-azure-document-intelligence-ocr.md` · `ADR/ADR-003-key-vault-secret-management.md`*
