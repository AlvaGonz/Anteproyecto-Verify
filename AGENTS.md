Aquí tienes el AGENTS.md expandido y fusionado — zero reducción, todo filtrado y anclado al objetivo del proyecto de grado: VeriFinca como sistema web de verificación y autenticación integral de proyectos inmobiliarios en la República Dominicana.

text
# AGENTS.md — VeriFinca / Anteproyecto-Verify
> **Version:** 4.0.0 | **Date:** 2026-06-29 | **Status:** Active & Enforced
> **Proyecto de Grado:** Sistema web de verificación y autenticación integral de proyectos
> inmobiliarios para prevención de estafas financieras mediante la validación de documentación
> legal, financiera y de propiedad en la República Dominicana.
> **Universidad Central del Este — Escuela de Ingeniería de Software — Año 2026**

---

## 🎯 MISSION STATEMENT (Anchored to Thesis Objectives)

VeriFinca exists to reduce real estate fraud in the Dominican Republic by automating the 
validation of legal, financial, and territorial documentation. Every agent action in this 
repository must serve one of the 7 specific thesis objectives:

| OE | Objective | Core RF |
|---|---|---|
| OE-1 | Diagnose essential documents based on RI regulations | RF-2 |
| OE-2 | Automate validation via DGII, Catastro, RI APIs | RF-3 → RF-6 |
| OE-3 | Detect registry/documentary duplicities (matricula, cadastral) | RF-3, RF-4 |
| OE-4 | Detect document inconsistencies and generate risk alerts | RF-2, RF-3 |
| OE-5 | Validate territorial correspondence via georeferencing | RF-5, RF-7 |
| OE-6 | Verify developer financial/credit status (Law 172-13) | RF-8, RF-9 |
| OE-7 | Certify integrity via Digital Seal + QR + digital signature (Law 126-02) | RF-10, RF-11 |

**Any code, spec, or agent task NOT traceable to at least one OE must be rejected.**

---

## 🤖 AGENTIC CONSTITUTION & ORCHESTRATION PROTOCOL (V3.0)
**Context:** Enterprise-Grade Spec-Driven Development
**Enforcement:** ALL AI agents MUST read and obey these directives before executing any 
task in this repository.

---

## 1. 🛑 THE ZERO-TRUST & SECURITY GUARDRAILS (DevSecOps)

Do not optimize for speed at the expense of security or architecture. You are acting as a 
Senior DevSecOps Engineer.

- **No Hallucinated Bypasses:** Never remove authentication guards, CORS policies, or input
  validation to "make it work."
- **Input Validation:** All incoming data MUST be validated using Zod schemas (frontend) and
  FluentValidation (backend).
- **OWASP Enforcement:** Sanitize all DB inputs to prevent SQLi. Escape all UI outputs to 
  prevent XSS. See §6 of TRD for full OWASP Top 10 enforcement table.
- **TDD Protocol:** Before fixing a bug or adding a feature, you MUST write a failing 
  unit/integration test first. Do not write implementation code until the failing test is 
  confirmed.
- **Law 172-13 Gate:** Never query TransUnion or process credit data without confirming 
  `ConsentRecord.IsRevoked = false` AND `ConsentRecord.ConsentVersion = CurrentTemplateVersion`.
  This is both a security AND legal compliance requirement (OE-6).
- **Law 126-02 Gate:** The Digital Integrity Seal (OE-7) must use RSA-2048 signing via 
  Azure Key Vault. Never implement a custom crypto scheme or hardcode keys.

---

## 2. 🔌 THE MCP (MODEL CONTEXT PROTOCOL) MANDATE

Do not guess data schemas, API contracts, or external states. If you need information 
outside this immediate repository, you MUST attempt to use an available MCP server.

| MCP Server | When to Connect | Purpose |
|---|---|---|
| **GitHub MCP** | PRs, Issues, branch review | Agent reads actual PR diff and comments instead of guessing state |
| **context7-mcp** | Framework/library syntax questions | Connect via Context7 MCP to get live ASP.NET Core 8, React 19, Zod, Tailwind 4 documentation |
| **Azure SQL / DB MCP** | Schema-related tasks | Agent reads live `AppDbContext` migrations to prevent hallucinated columns |
| **Stitch MCP** | UI/component tasks | Agent pulls VeriFinca design tokens directly; never hallucinate hex codes (`#F98513`, `#223382`, `#9BACD8`, `#DAD1C8`) |
| **Azure Key Vault MCP** | Secret audit tasks | Agent validates Key Vault secret inventory without reading `.env` files |

**Rule:** If an IDE agent task involves reading existing data (schema, issue state, design 
tokens), the corresponding MCP server MUST be active. Failure to connect = context-blind 
agent = source of Zombie Reverts.

---

## 3. 🏗️ MERMAID ARCHITECTURE ENFORCEMENT

Text is for humans; Mermaid is for machines. You must maintain architectural state.

- **No Code Before Spec:** Do not write implementation code for a new feature without first
  validating the system design against `.agents/docs/ARCHITECTURE.md`.
- **Living Documentation:** If you alter the data flow, database schema, or service 
  interaction, you MUST update the Mermaid.js C4/Sequence diagrams in 
  `.agents/docs/ARCHITECTURE.md` (or the respective TRD section).
- **Sync Check:** Ensure that the Zod schemas (frontend) match the Mermaid Entity-
  Relationship (ER) diagrams and the EF Core AppDbContext exactly.
- **VeriFinca Diagrams Required:** The following diagrams must always be current:
  - C4 Level 1 — System Context (RI, Catastro, DGII, TransUnion, DocAI, Resend)
  - C4 Level 2 — Container Diagram (SPA, API, Worker, SQL, Blob, Bus, KeyVault, Insights)
  - C4 Level 3 — Component Diagram (API + Application layer)
  - Async Validation Sequence (RF-3 → RF-7 full flow)
  - Seal Issuance Sequence (RF-10 guard chain)
  - Consent Guard Flowchart (RF-8 + RF-9, Law 172-13)
  - ERD (6 core tables: Projects, Documents, ValidationResults, ConsentRecords, 
    IntegritySeals, AuditLogs)
  - Clean Architecture Dependency Rules (enforced via dotnet-archunit in CI)
  - CI/CD Pipeline Flow (12-step gate)

---

## 4. 🔄 ROLE-BASED EXECUTION STATES

When instructed to perform a task, determine which "Role" you are fulfilling and act 
strictly within its boundaries:

| Agent Role | Session | Responsibility | Input | Output |
|---|---|---|---|---|
| **Role A: The Architect** | Perplexity Space / Planning | System design, spec writing, TRD updates, ADR authoring, Mermaid diagrams | Feature request / gap analysis | Updated `TRD.md`, `ARCHITECTURE.md`, `ADR/`, `AGENTS.md` |
| **Role B: The Developer** | Cursor Composer / Windsurf Cascade | Implementation of a single, context-bounded feature | Approved spec + referenced files from TRD | Production code + unit tests |
| **Role C: The Reviewer** | Separate chat session | Audits Coder output against TRD spec | Coder's diff + TRD section | Review comments, security findings, refactoring plan |

**Mandatory Transition Protocol:**
[Architect Agent] → Approves spec → [Coder Agent]
[Coder Agent] → Commits code → [Reviewer Agent]
[Reviewer Agent] → Approves PR → Merge to branch

text

No agent skips a stage. The Coder Agent must not author specs. The Reviewer Agent must not 
write implementation code.

---

## 5. 📌 COMMIT & CHECKPOINT PROTOCOL

- **Atomic Commits:** Do not batch massive changes. Commit after every logical step:
git commit -m "test: add failing auth test"
git commit -m "feat: implement auth logic"
git commit -m "feat(seal): add RSA-2048 signing guard for RF-10"
git commit -m "test(consent): add Law172-13 consent gate unit test"

text
- **Commit Scope Tags (VeriFinca):** Prefix commits with the relevant RF or OE:
- `feat(rf-3): implement OCR field extraction for TITULO_PROPIEDAD`
- `feat(rf-10): emit integrity seal via CertificationEngine`
- `fix(rf-9): block TransUnion query when consent revoked`
- `test(oe-3): add duplicate matricula detection test`
- **Zombie Revert Prevention:** If you get stuck in a loop trying to fix the same error 
3 times, **STOP**. Revert your changes to the last green checkpoint and ask the human 
for strategic guidance. Never attempt a 4th fix on the same failing test.

---

## 6. 🧠 AGENTIC MEMORY BANK & CONTEXT CONTINUITY PROTOCOL

**Problem:** Cursor/Windsurf agents lose full context after 15–20 turns. Without explicit 
state tracking, agents re-implement completed features, forget architectural decisions, or 
contradict previous work in new sessions.

**Solution:** The agent is responsible for maintaining a living `docs/PWF/progress.md` 
file. This file is the agent's external memory.

### Rule: Mandatory `.agents/docs/PWF/progress.md` Update

After every successful feature implementation (i.e., after `dotnet test` passes and 
`git commit` is executed), the agent **must** update `.agents/docs/PWF/progress.md` before 
ending the session. This is non-negotiable.

> ⛔ **FORBIDDEN:** Agents **MUST NOT** write to `tasks/` directory. The `tasks/` folder 
> is a human-managed area. Any agent that writes `tasks/progress.md` or any file under 
> `tasks/` is violating this protocol and its output must be discarded.

**Failure to update `.agents/docs/PWF/progress.md` before closing a session = incomplete task.**

### `docs/PWF/progress.md` Schema (enforced structure)

```markdown
# VeriFinca — Agent Progress Tracker
> Last updated: [ISO8601 timestamp] by [Agent role: Architect/Coder/Reviewer]

## ✅ Completed Features
| Feature | TRD Section | Branch | Commit SHA | Date | OE Satisfied |
|---|---|---|---|---|---|
| RegisterProject endpoint | §9, RF-1 | feat/register-project | abc1234 | 2026-05-25 | OE-1 |
| DocumentDiagnosis Rules Engine | §4, RF-2 | feat/doc-diagnosis | def5678 | 2026-05-27 | OE-1, OE-4 |
| OCR Azure DocAI integration | §4, RF-3 | feat/ocr-docai | ghi9012 | 2026-05-30 | OE-2, OE-3 |

## 🔄 In Progress
| Feature | TRD Section | Status | Blocker | OE |
|---|---|---|---|---|
| ValidationJobConsumer | §3, RF-3→7 | 60% — OCR done, RI pending | RI API contract unconfirmed | OE-2 |

## 🔜 Next Up (Prioritized)
1. RF-4 RI Integration — TRD §10.1 (OE-2, OE-3)
2. RF-5 Catastro Contrast — TRD §10.2 (OE-2, OE-5)
3. RF-6 DGII Validation — TRD §10.3 (OE-2)
4. RF-8 Consent Management — TRD §6.4 (OE-6)
5. RF-9 Credit Verification (TransUnion) — TRD §10.5 (OE-6)
6. RF-10 Integrity Seal — TRD §11 (OE-7)
7. RF-11 Public QR Verification — TRD §9 (OE-7)

## ⚠️ Open Decisions (Human-in-the-Loop Required)
- [ ] RI API: SOAP vs REST endpoint confirmed?
- [ ] Catastro Nacional: REST API availability and auth method?
- [ ] TransUnion DR: Production API sandbox available?
- [ ] DGII public RNC endpoint: rate limit policy?
- [ ] Azure AI Document Intelligence: Custom model training dataset ready?

## 🚫 Known Constraints
- Do NOT implement TransUnion query until ConsentRecord gate is merged and green
- Do NOT delete ConsentRecords or AuditLogs — 7-year retention required by Law 172-13
- Do NOT bypass FluentValidation on any new DTO
- Do NOT store secrets in appsettings.json — Key Vault only
- Do NOT issue IntegritySeal unless ALL ValidationResults.Status = PASS (RF-10 guard)
```

### Context Recovery Protocol (After `/clear` or New Session)

When starting a new session, the **first action** before any code is written must be:
Read @.agents/docs/PWF/progress.md

Read @.agents/docs/TRD_VeriFinca.md §[section relevant to next task]

Read @.agents/docs/ARCHITECTURE.md [relevant diagram section]

Read @.agents/docs/AGENTS.md

THEN: ask the human to confirm "Next Up" item before proceeding

text

An agent that skips step 1 and starts coding without reading `.agents/docs/PWF/progress.md` 
is operating context-blind and **must be stopped**.

---

## 7. 🧠 Codebase Intelligence — codebase-memory-mcp (MANDATORY)

**Every agent session MUST start by querying the codebase graph before reading, writing, 
or modifying any file.** This MCP provides a live semantic graph of the repository. Using 
it before acting prevents stale reads, zombie reverts, and blast-radius surprises.

### Mandatory Bootstrap Sequence (run in this order)
get_architecture → Codebase overview: languages, packages, routes, hotspots, clusters, ADR.

get_graph_schema → Node/edge counts, relationship patterns, property definitions.

search_graph → Locate symbols by label, name pattern, or file pattern.

text

### When to Use Each Tool

| Trigger | Tool | Why |
|---------|------|-----|
| Starting any task | `get_architecture` | Get full codebase map before touching files |
| Before reading/editing a file | `search_graph` | Find what imports it, what it exports |
| Tracing a bug or call chain | `trace_path` (alias `trace_call_path`) | BFS traversal depth 1–5 |
| Before merging/deploying | `detect_changes` | Map git diff → affected symbols + blast radius + risk |
| Understanding relationships | `query_graph` | Cypher-like read-only queries |
| Reading function source | `get_code_snippet` | Fetch source by qualified name |
| Text/pattern search | `search_code` | Grep-like within indexed project files |
| Checking index freshness | `index_status` | Verify auto-sync is current |
| Managing ADRs | `manage_adr` | CRUD for Architecture Decision Records |
| Validating HTTP call edges | `ingest_traces` | Ingest runtime traces |

### Rules

- **Never skip `get_architecture` at session start.** Even for "small" tasks.
- **`detect_changes` before every PR or deploy.** Blast radius must be known before 
  merging to `develop`.
- **`trace_path` before refactoring any shared service.** Depth 3 minimum on 
  `Application` layer symbols.
- **`search_graph` before creating a new file.** A symbol with that name may already exist.
- If `index_status` shows stale index → run `index_repository` before proceeding.

---

## 8. 🏗️ Project Structure

### Monorepo Layout

| Stack | Location | Tech |
|-------|----------|------|
| Backend API | `src/backend/` | ASP.NET Core 8, Clean Architecture |
| Frontend web | `src/frontend/web/` | React 19, TypeScript, Vite 6, Tailwind 4 |

**Backend layers** (dependency order): `Domain` → `Application` → `Infrastructure` → `Api`

**Frontend entrypoint**: `src/frontend/web/src/main.tsx`

### Clean Architecture Directory Tree (Enforced)
src/
├── VeriFinca.Domain/
│ ├── Entities/ # Project, Document, ConsentRecord, IntegritySeal, AuditLog
│ ├── Enums/ # ValidationStatus, DocumentType, Role, AlertCode
│ ├── Interfaces/ # IProjectRepository, ISealRepository, IConsentRepository
│ └── Exceptions/ # DomainException, ConsentRequiredException, DuplicateMatriculaException
│
├── VeriFinca.Application/
│ ├── Commands/ # RegisterProjectCommand, IssueIntegritySealCommand, TriggerValidationCommand
│ ├── Queries/ # GetProjectQuery, GetValidationResultsQuery, GetDocumentDiagnosisQuery
│ ├── Handlers/ # One handler class per Command/Query (no shared handlers)
│ ├── DTOs/ # Request / Response records (C# records – immutable)
│ ├── Validators/ # FluentValidation per DTO (one class per DTO, assembly-scanned)
│ └── Interfaces/ # IOcrService, IGovernmentApiService, ISealingService, IConsentService
│
├── VeriFinca.Infrastructure/
│ ├── Persistence/ # AppDbContext, Migrations/, Repositories/
│ ├── ExternalApis/ # RiClient, DgiiClient, CatastroClient, TransUnionClient (Polly retry)
│ ├── Messaging/ # ServiceBusPublisher, ValidationJobConsumer (IHostedService)
│ ├── Ocr/ # AzureDocumentIntelligenceService (implements IOcrService)
│ ├── Sealing/ # CertificationEngine (Key Vault RSA-2048 signing, Law 126-02)
│ ├── Security/ # JwtService, KeyVaultSecretProvider (Managed Identity)
│ └── BackgroundJobs/ # DataRetentionPurgeJob (Law 172-13 TTL enforcement)
│
├── VeriFinca.Api/
│ ├── Controllers/ # AuthController, ProjectsController, ValidationController, PublicController
│ ├── Middleware/ # ErrorHandlingMiddleware, RateLimitMiddleware, SecurityHeadersMiddleware
│ ├── Filters/ # RbacAuthorizationFilter
│ └── Program.cs
│
└── VeriFinca.Tests/
├── Unit/ # xUnit + Moq – Domain, Rules Engine, CertificationEngine guards
├── Integration/ # TestContainers (SQL Server) + WireMock.NET (govt APIs)
└── Security/ # OWASP ZAP headless scan scripts

text

**Boundary rule enforced via `dotnet-archunit`:**
- `Api` → `Application` only (never `Infrastructure` or `Domain` directly).
- `Application` → `Domain` only (never `Infrastructure`).
- `Infrastructure` → `Domain` and `Application.Interfaces` only.

### RBAC Roles

| Role | Scope |
|---|---|
| `ADMIN` | All modules + rule configuration + audit + requeue DLQ |
| `DEVELOPER` | Own projects: register, upload documents, grant consent, read own validations |
| `VALIDATOR` | Trigger all validations, review results, approve seal |
| `PUBLIC` | RF-11 – QR seal lookup only (unauthenticated, rate-limited 60 req/min per IP) |

---

## 9. 🚀 Quick Start

### Docker (Recommended for Full Stack)

```bash
# Copy .env (already exists, verify contents)
docker compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health check | http://localhost:5000/health |
| Status | http://localhost:5000/api/status |
| SQL Server | localhost:1433 |
| Azurite (Blob) | localhost:10000 |

### Frontend-Only (No Docker)

```bash
cd src/frontend/web
pnpm install
pnpm run dev          # starts on port 3000
```

---

## 10. 📦 Package Manager

- **pnpm** (v9+) — workspace root has `pnpm-workspace.yaml` pointing to `src/frontend/web`
- Lockfile: `pnpm-lock.yaml` at root
- Install: `pnpm install --frozen-lockfile` (CI) or `pnpm install` (dev)
- Root `package.json` scripts run Vite from root context

---

## 11. 🧪 Testing

### Frontend (Vitest)

```bash
cd src/frontend/web
pnpm run test                    # all tests (vitest run)
pnpm exec vitest --run src/pages/auth/__tests__/RegisterPage.test.tsx  # single file
pnpm exec vitest                 # watch mode
```

**Vitest quirks:**
- Uses `pool: 'threads'` (not `forks`) — `forks` causes EPERM on Windows
- Environment: `jsdom`
- Setup file: `src/setupTests.ts` (mocks `react-i18next`)
- `@testing-library/react` + `@testing-library/jest-dom` available
- `axios-mock-adapter` available for HTTP mocking

### Backend (xUnit)

```bash
# Unit tests (Domain + Application — 80% coverage gate)
dotnet test tests/backend/UnitTests/UnitTests.csproj

# Integration tests (requires SQL Server Docker)
dotnet test tests/backend/IntegrationTests/IntegrationTests.csproj

# API tests
dotnet test src/backend/Api.Tests/Api.Tests.csproj

# Single test with filter
dotnet test tests/backend/UnitTests/UnitTests.csproj --filter "FullyQualifiedName~ValidarTerritorio"
```

**Backend test quirks:**
- Uses xUnit + Moq + NetArchTest.Rules
- CI runs with `--filter "Category!=Integration"` to skip integration tests in fast gate
- Integration tests require SQL Server (Docker via TestContainers)
- WireMock.NET mocks all external government APIs (RI, DGII, Catastro, TransUnion)

### VeriFinca-Specific Test Coverage Requirements

| Layer | Min Coverage | Reason |
|---|---|---|
| `Domain` | 90% | Core fraud-prevention logic — no regression tolerance |
| `Application` | 80% | All handlers, validators, Rules Engine (OE-1 through OE-7) |
| `Infrastructure.Sealing` | 100% | Law 126-02 compliance — RSA signing path must be fully tested |
| `Infrastructure.ExternalApis` | 70% | Polly retry + circuit breaker paths |

### Security Test Categories (MUST exist before merging any endpoint)
tests/backend/UnitTests/Security/
├── ConsentGateTests.cs # OE-6: TransUnion blocked without consent
├── IssueIntegritySealGuardTests.cs # OE-7: Seal blocked if any FAIL result
├── DuplicateMatriculaTests.cs # OE-3: Duplicate detection
├── RbacTests.cs # ADMIN/DEVELOPER/VALIDATOR/PUBLIC isolation
└── DataRetentionPurgeTests.cs # Law 172-13 TTL enforcement

text

### E2E (Playwright)

```bash
# From root
pnpm exec playwright test e2e/auth/          # auth tests
pnpm exec playwright test e2e/projects/      # project registration + document upload
pnpm exec playwright test e2e/validations/   # trigger + poll async validation
pnpm exec playwright test e2e/seal/          # QR seal issuance and public verification
pnpm exec playwright test e2e/api/           # API contract tests
```

**Playwright quirks:**
- Config at root `playwright.config.ts`
- Projects: `api`, `auth`, `frontend`, `seal-verification`
- `fullyParallel: false`, `workers: 1` — tests run sequentially
- Global setup: `e2e/global-setup.ts`
- Web server auto-starts Vite on port 5173 for frontend tests
- Screenshots on failure, video on failure, trace on first retry

---

## 12. ⚙️ Build & Type Checking

```bash
# Frontend build (tsc -b && vite build)
cd src/frontend/web && pnpm run build

# TypeScript check only (no emit)
pnpm exec tsc --noEmit

# Lint
pnpm run lint
```

**TypeScript quirks:**
- Root `tsconfig.json`: `@/*` → `./*` (root-relative)
- Frontend `tsconfig.json`: `@/*` → `src/*` (frontend-relative)
- Frontend uses `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- Root tsconfig includes `stitch_verifinca_real_estate_validation/` (design token reference)

---

## 13. 🗄️ Database

- SQL Server via Docker (`docker-compose.yml`)
- EF Core 8 with SQL Server provider
- Auto-creates tables on dev startup (`Program.cs` resilience loop: 30 retries, 2s delay)
- Seeder: `AppDbContextSeeder.SeedAsync()` runs on dev startup
- Migration command:
  ```bash
  cd src/backend
  dotnet ef migrations add <Name> \
    --project Infrastructure/Infrastructure.csproj \
    --startup-project Api/Api.csproj \
    --output-dir Persistence/Migrations
  ```
- DbSeeder tool: `src/backend/Tools/DbSeeder/`
- **NEVER write raw SQL.** EF Core parameterized queries only.

### Core Schema Quick Reference

| Table | Purpose | Retention |
|---|---|---|
| `Projects` | Real estate project metadata (RNC, Matricula, GPS, status) | Indefinite |
| `Documents` | Uploaded PDFs/images + OCR results (BlobSha256) | 90 days post-seal |
| `ValidationResults` | Per-source results (RI, DGII, Catastro, OCR, TransUnion) | 30 days (TRANSUNION) |
| `ConsentRecords` | Law 172-13 consent, immutable insert | 7 years |
| `IntegritySeals` | RSA-2048 signed seals + QR URL | Indefinite |
| `AuditLogs` | All user actions with IP + old/new values | 7 years |

---

## 14. 🌍 Environment

- Root `.env` file loaded by Docker Compose
- Frontend env files: `src/frontend/web/.env.development`, `.env.staging`, `.env.production`
- Frontend Vite config uses `loadEnv(mode, '.', '')` from root
- **ALL secrets must be in Azure Key Vault.** Never in `.env`, `appsettings.json`, 
  Docker images, or source code.

| Secret Name | Type | Usage |
|---|---|---|
| `verifinca-jwt-secret` | Secret | JWT HMAC-SHA256 signing |
| `verifinca-rsa-private-key` | Key (RSA-2048) | Integrity Seal signing (Law 126-02 Art. 32) |
| `verifinca-rsa-public-key` | Key (RSA-2048) | Published at `/public/.well-known/signing-key.pem` |
| `verifinca-db-connectionstring` | Secret | Azure SQL connection |
| `verifinca-servicebus-connectionstring` | Secret | Azure Service Bus |
| `verifinca-ri-apikey` | Secret | Registro Inmobiliario API |
| `verifinca-transunion-apikey` | Secret | TransUnion DR API |
| `verifinca-docai-key` | Secret | Azure AI Document Intelligence |
| `verifinca-storage-key` | Secret | Azure Blob Storage |

---

## 15. 🔁 CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/ci.yml`

| Job | What it does |
|-----|-------------|
| `backend` | Restore → Build all 6 csproj → Unit tests (coverage gate) → Integration tests → Api.Tests → archunit layer check |
| `frontend` | pnpm install → tsc --noEmit → Vitest → Playwright CRUD + seal tests → Vite build |
| `security` | OWASP ZAP headless on staging, Semgrep SAST, dotnet-outdated CVE scan, secret scan on diff |
| `e2e-tests` | Depends on backend + frontend → Playwright auth + validation + seal tests |

**CI Gates (all must be green before merge to `develop`):**
1. `dotnet build` — zero errors
2. Unit tests — 80%+ coverage on Domain + Application
3. Integration tests — zero failures
4. `dotnet-archunit` — zero layer violations
5. SonarCloud — no critical/blocker issues
6. `dotnet-outdated` — no HIGH CVE components
7. GitHub Advanced Security — no leaked secrets in diff
8. Docker build + push to ACR
9. Deploy to staging slot
10. OWASP ZAP headless scan — no high-severity findings
11. Smoke test `GET /health` → 200
12. Slot swap → Production

**CI quirks:**
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'` in env
- Frontend tests run with `VITE_USE_MOCK: 'true'`
- E2E tests run with `ASPNETCORE_ENVIRONMENT: Development`
- Playwright installs only Chromium: `pnpm exec playwright install --with-deps chromium`
- All GitHub Actions pinned to immutable SHAs (OWASP supply chain requirement)

---

## 16. 🏛️ Architecture Notes

- **Clean Architecture**: Domain has zero dependencies; Application depends on Domain; 
  Infrastructure depends on Application; Api depends on Infrastructure
- **CQRS-like with MediatR**: One handler per Command/Query. Key handlers:
  - `ValidarTerritorioHandler` — OE-5 (georeferencing)
  - `EmitirSelloHandler` (→ `IssueIntegritySealCommand`) — OE-7
  - `GetDocumentDiagnosisQueryHandler` — OE-1, OE-4
  - `TriggerValidationCommand Handler` — OE-2 (enqueues to Service Bus)
  - `RecordConsentCommand Handler` — OE-6 (Law 172-13)
- **FluentValidation** for all request validation (assembly-scanned, one class per DTO)
- **JWT auth** with `Microsoft.AspNetCore.Authentication.JwtBearer`
  - Access token TTL: 1 hour; refresh token TTL: 30 days (single-use, rotated)
  - 2FA mandatory for ADMIN + VALIDATOR roles
- **QuestPDF** for PDF report generation (validation reports + seal PDF)
- **ClosedXML** for Excel export of validation results
- **Resend** for transactional email (validation status, seal issued notifications)
- **BCrypt.Net-Next** (cost factor 12) for password hashing
- **Azure Blob Storage** (Azurite for local dev) — versioning enabled
- **DGII validation** service — public REST API, cached 48h on PASS result
- **Polly** retry + circuit breaker on all external government API clients
  (RI, Catastro, DGII, TransUnion) — 3 retries + exponential backoff

### Async Validation Architecture

All OCR and government API calls are **decoupled from the HTTP request cycle** via 
**Azure Service Bus** (`verifinca-validation-jobs` queue):
- Max delivery count: 3 → Dead-Letter Queue on failure
- Lock duration: 5 minutes
- Message TTL: 24 hours
- DLQ alert emitted to Application Insights: `ValidationJobDeadLettered`
- Admin requeue: `POST /admin/validations/requeue/{messageId}` (ADMIN only)

### External Integrations

| Integration | RF | Auth | Fallback |
|---|---|---|---|
| Azure AI Document Intelligence | RF-3 | Managed Identity → Key Vault | prebuilt-document model |
| Registro Inmobiliario (RI) | RF-4 | API Key from Key Vault | Status: FALLBACK, 3x retry |
| Catastro Nacional | RF-5 | API Key from Key Vault | Status: FALLBACK, 3x retry |
| DGII RNC validation | RF-6 | Public REST (no key) | Cached 48h; retry on timeout |
| Geolocation / Catastro | RF-7 | REST | Compare GPS vs cadastral designation |
| TransUnion DR | RF-9 | API Key from Key Vault | Blocked unless consent active |

---

## 17. 🔒 Security Architecture Invariants

These are non-negotiable. Violation of any invariant = CI failure or HUMAN GATE.

1. **Never write raw SQL.** EF Core parameterized queries only. (A03 – Injection)
2. **Never add secrets to `appsettings.json`.** All secrets in Azure Key Vault. (A02)
3. **Never bypass FluentValidation.** All DTOs must have a registered validator. (A03)
4. **Always update ARCHITECTURE.md** Mermaid diagrams before implementing a new flow. (A04)
5. **Never issue IntegritySeal** unless all `ValidationResults.Status = PASS`, 
   no `Document.Status ∈ {INVALID, MISSING}`, `ConsentRecord.IsRevoked = false`. (OE-7)
6. **Never delete `ConsentRecords` or `AuditLogs`** before 7-year retention. (Law 172-13)
7. **Never query TransUnion** without active, version-matched `ConsentRecord`. (Law 172-13, OE-6)
8. **Never expose stack traces** in production error responses. (A05)
9. **Never allow outbound HTTP** to non-whitelisted government API domains. (A10 – SSRF)
10. **SHA-256 hash all uploaded documents** (`Documents.BlobSha256`). (A08, OE-3)

### Security Headers (Applied by `SecurityHeadersMiddleware` on every response)
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()

text

### Data Retention Schedule (Law 172-13 Enforcement)

| Data | Table | Retention | Purge Action |
|---|---|---|---|
| TransUnion credit reports | `ValidationResults.ResponseJson` WHERE `Source = 'TRANSUNION'` | 30 days post-seal | Hard-delete or anonymize |
| Uploaded documents (blob) | `Documents.BlobUrl` + Azure Blob | 90 days post-closure | Delete blob + `BlobUrl = '[PURGED]'` |
| OCR raw output | `Documents.OcrResultJson` | 90 days (same as docs) | Set to NULL |
| Consent records | `ConsentRecords` | 7 years | Archive to cold storage |
| Audit logs | `AuditLogs` | 7 years | Archive to cold storage |
| Revoked refresh tokens | `RefreshTokens` | 7 days post-expiry | Hard-delete |

Purge job: `VeriFinca.Infrastructure/BackgroundJobs/DataRetentionPurgeJob.cs`
Runs: daily cron at 02:00 UTC. Emits `DataRetentionPurgeCompleted` to Application Insights.

---

## 19. 🛠️ Pre-commit Hooks & Other Config

- `.pre-commit-config.yaml` runs `agent-firewall` hook (Python at `.agents/scripts/post_task_loop.py`)
- Triggers on `.py`, `.js`, `.ts` files
- `reviewdog.json` — Reviewdog CI integration
- `Dangerfile` — Danger CI checks (PR size, changelog, migration review)
- `.trunk/trunk.yaml` — Trunk.io linting config
- `.waza.yaml` — Waza AI config
- `.semgrepignore` — Semgrep SAST ignore rules
- `.securecoder.ignore` — SecureCoder ignore rules

| File | Purpose |
|------|---------|
| `.editorconfig` | Consistent editor settings across agents |
| `.npmrc` | npm/pnpm config |
| `.gitignore` | Git ignore (includes `.env`, `appsettings.*.json`) |
| `.dockerignore` | Docker build context ignore |
| `Directory.Build.props` | Shared MSBuild properties for all csproj |
| `playwright.config.ts` | E2E test config (api, auth, frontend, seal-verification) |

---

## 20. 📐 Design Tokens (Stitch MCP — Do Not Hallucinate)

| Token | Value | Usage |
|---|---|---|
| Primary | `#F98513` | Primary actions, CTAs, brand elements |
| Secondary | `#223382` | Secondary actions, chips, navigation |
| Tertiary | `#9BACD8` | Highlights, badges, decorative |
| Neutral | `#DAD1C8` | Backgrounds, surfaces, non-chromatic elements |

**If implementing any UI component:** Connect to Stitch MCP first. Do not hardcode these 
values in component files — use Tailwind CSS design token variables as configured in 
`tailwind.config.ts`.

---

## 21. 🚦 Human Gate Triggers (STOP — Require Approval)

These operations require explicit human approval before any agent proceeds:

| Trigger | Reason |
|---|---|
| Any EF Core migration | Schema change is irreversible in production |
| Any change to `ConsentRecords` table structure | Law 172-13 compliance |
| Any change to `IntegritySeals` or `CertificationEngine` | Law 126-02 compliance |
| Any new external API integration (RI, DGII, Catastro, TransUnion) | API contract and legal review |
| Changes to `RbacAuthorizationFilter` or JWT configuration | Auth regression risk |
| Any purge job modifying `ConsentRecords` or `AuditLogs` | 7-year retention violation risk |
| Deployment to production slot | Final human review gate |
| Any change to public API endpoints (RF-11) | Public contract — no silent breaking changes |

---