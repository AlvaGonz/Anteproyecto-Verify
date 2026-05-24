# 🔍 AUDIT.md — Comprehensive Codebase Audit

**Project:** VeriFinca (Anteproyecto-Verify)  
**Date:** 2026-05-24  
**Stack:** .NET 8 (ASP.NET Core) + Vite/React 19 + TypeScript 5.8  

---

## 1. Repository Layout Summary

```
Anteproyecto-Verify/
├── .agent/                    # Agent rules, workflows, skills
├── dist/                      # ⚠️ Committed build output (root)
├── docker/                    # 4 Dockerfiles (api + web, dev + prod)
├── docs/decisions/            # 1 ADR (ADR-009-certificacion.md)
├── scripts/                   # dev-up/dev-down scripts (PS1 + SH)
├── src/
│   ├── backend/
│   │   ├── Api/               # ASP.NET Core Web API (22 controllers)
│   │   ├── Api.Tests/         # xUnit tests (3 files + 1 dead file)
│   │   ├── Application/       # CQRS features, abstractions, DTOs
│   │   ├── Domain/            # 18 entities, 20 enums, value objects
│   │   ├── Infrastructure/    # EF Core, Resend, QuestPDF, ClosedXML
│   │   └── Tools/DbSeeder/    # Database seeder tool
│   └── frontend/
│       └── web/               # Vite + React 19 frontend
│           └── src/           # features/, pages/, shared/, infrastructure/
├── tasks/                     # Task plans and findings
├── tests/
│   ├── backend/               # IntegrationTests + UnitTests
│   └── frontend/              # 1 test (HealthPage)
├── package.json               # ⚠️ Duplicate/legacy root package.json
├── vite.config.ts             # ⚠️ Duplicate/legacy root Vite config
├── index.html                 # ⚠️ Duplicate/legacy root HTML entry
└── tsconfig.json              # ⚠️ Root TS config
```

> [!IMPORTANT]  
> **No `.github/workflows/` directory found** — CI/CD is not configured.  
> **No `AGENTS.md` found** — domain coverage baseline not defined.

---

## 2. Dependency Analysis

### 2.1 Frontend Dependencies (`src/frontend/web/package.json`)

| Dependency | Version | Status |
|---|---|---|
| `clsx` | 2.1.1 | ✅ USED |
| `framer-motion` | 12.38.0 | ✅ USED |
| `i18next` | 24.2.2 | ✅ USED |
| `lucide-react` | 0.546.0 | ✅ USED |
| `react` | 19.0.0 | ✅ USED |
| `react-dom` | 19.0.0 | ✅ USED |
| `react-i18next` | 15.4.0 | ✅ USED |
| `react-qr-code` | 2.0.18 | ✅ USED |
| `react-router-dom` | 7.0.0 | ✅ USED |
| `tailwind-merge` | 3.5.0 | ✅ USED |

**Result:** All 10 dependencies are in use. No dead dependencies found.

### 2.2 Root `package.json` (Legacy/Duplicate)

> [!WARNING]
> The **root `package.json`** appears to be a legacy artifact from before the monorepo restructure. Multiple packages are not used anywhere in the active codebase:

| Package | Status | Notes |
|---|---|---|
| `@google/genai` | ⚠️ **UNUSED** | Not imported in any `.ts/.tsx` file |
| `dotenv` | ⚠️ **UNUSED** | Not imported anywhere |
| `express` | ⚠️ **UNUSED** | Not imported anywhere |
| `motion` | ⚠️ **UNUSED** | Redundant with `framer-motion` |
| `@tailwindcss/vite` | ⚠️ **DUPLICATE** | Also in `web/package.json` devDeps |
| `@vitejs/plugin-react` | ⚠️ **DUPLICATE** | Also in `web/package.json` devDeps |
| `clsx` | ⚠️ **DUPLICATE** | Also in `web/package.json` |
| `framer-motion` | ⚠️ **DUPLICATE** | Also in `web/package.json` |
| `lucide-react` | ⚠️ **DUPLICATE** | Also in `web/package.json` (different versions!) |
| `react` | ⚠️ **DUPLICATE** | Also in `web/package.json` |
| `react-dom` | ⚠️ **DUPLICATE** | Also in `web/package.json` |
| `react-qr-code` | ⚠️ **DUPLICATE** | Also in `web/package.json` |
| `react-router-dom` | ⚠️ **DUPLICATE** | Also in `web/package.json` (different versions!) |
| `tailwind-merge` | ⚠️ **DUPLICATE** | Also in `web/package.json` (different versions!) |

**Action Required:** Remove the root `package.json`, `vite.config.ts`, root `index.html`, `tsconfig.json`, and `pnpm-lock.yaml` if the canonical frontend lives under `src/frontend/web/`.

### 2.3 Backend Dependencies (`.csproj` files)

| Package | Project | Status |
|---|---|---|
| `Resend 0.5.1` | Infrastructure.csproj | ✅ USED |
| `Resend 0.5.1` | **Api.csproj** | ⚠️ **DUPLICATE** — should only be in Infrastructure |
| `QuestPDF 2024.3.4` | Infrastructure.csproj | ✅ USED (report generation) |
| `ClosedXML 0.102.2` | Infrastructure.csproj | ✅ USED (Excel export) |
| `EF Core SqlServer 8.0.2` | Infrastructure.csproj | ✅ USED |
| `EF Core InMemory 8.0.2` | Infrastructure.csproj | ✅ USED (mock DB) |
| `EF Core Design 8.0.2` | Api.csproj | ✅ USED (migrations tooling) |
| `HealthChecks 2.2.0` | Api.csproj | ✅ USED |
| `HealthChecks.SqlServer 8.0.0` | Api.csproj | ✅ USED |

> [!CAUTION]
> **`Resend` is listed in both `Api.csproj` and `Infrastructure.csproj`**. The `Api` project already references `Infrastructure`, so the transitive dependency is sufficient. Remove from `Api.csproj`.

---

## 3. Architecture Boundary Violations

### 3.1 Layer Separation

| Rule | Check | Result |
|---|---|---|
| Frontend → Server imports | `grep "from.*server/" src/` | ✅ **CLEAN** (0 matches) |
| Frontend → Backend imports | `grep "from.*backend/" src/` | ✅ **CLEAN** (0 matches) |
| Backend → Frontend imports | `grep "from.*frontend" backend/` | ✅ **CLEAN** (0 matches) |
| Direct `fetch()` in feature components | `grep "fetch(" src/features/` | ✅ **CLEAN** (0 matches) |
| Deep relative imports (>2 levels) | `grep "from '../../.." src/` | ✅ **CLEAN** (0 matches) |

**Verdict:** All architecture boundaries are intact. No cross-layer violations detected.

### 3.2 Backend Clean Architecture

| Rule | Status |
|---|---|
| Domain → no outward dependencies | ✅ Domain.csproj has no PackageReferences beyond SDK |
| Application → depends only on Domain | ✅ Application.csproj → Domain.csproj only |
| Infrastructure → depends on Application | ✅ Infrastructure.csproj → Application.csproj |
| Api → depends on Application + Infrastructure | ✅ Api.csproj → both |

**Verdict:** Clean Architecture dependency flow is correct: `Domain ← Application ← Infrastructure ← Api`.

---

## 4. Monolithic Files (>300 lines)

| File | Lines | Severity | Action |
|---|---|---|---|
| [AppDbContextSeeder.cs](file:///c:/Users/Admin/Desktop/Anteproyecto-Verify/src/backend/Infrastructure/Persistence/AppDbContextSeeder.cs) | 304 | 🟡 LOW | Extract per-entity seed methods |
| [mockProjects.ts](file:///c:/Users/Admin/Desktop/Anteproyecto-Verify/src/frontend/web/src/infrastructure/mock/mockProjects.ts) | 320 | 🟡 LOW | Acceptable for mock data |
| [RulesManagePage.tsx](file:///c:/Users/Admin/Desktop/Anteproyecto-Verify/src/frontend/web/src/pages/admin/RulesManagePage.tsx) | 334 | 🟠 MEDIUM | Extract subcomponents |
| [ProjectPublicDetailPage.tsx](file:///c:/Users/Admin/Desktop/Anteproyecto-Verify/src/frontend/web/src/pages/projects/ProjectPublicDetailPage.tsx) | 332 | 🟠 MEDIUM | Extract subcomponents |

---

## 5. Naming Inconsistencies & Duplicate Feature Folders

> [!WARNING]
> The `Application/Features/` directory has **duplicate domains** with mixed English/Spanish naming, splitting the same logical domain across two folders:

| Domain | Folder 1 | Folder 2 | Issue |
|---|---|---|---|
| Audit Trail | `Features/Audit/` (Queries) | `Features/Auditoria/` (Commands) | ⚠️ **SPLIT** — merge into single folder |
| Reports | `Features/Reports/` (Queries) | `Features/Reportes/` (Commands) | ⚠️ **SPLIT** — merge into single folder |
| Validation | `Features/Validation/` (Commands+Queries) | `Features/Validations/` (Commands) | ⚠️ **SPLIT** — merge into single folder |

**Action Required:** Pick ONE naming convention (English recommended) and consolidate each pair into a single folder. Update DI registrations in `DependencyInjection.cs` accordingly.

### 5.1 DTO Placement

Loose DTOs exist directly under `Application/DTOs/`:
- `DocumentoDto.cs`, `HallazgoDto.cs`, `ProyectoDto.cs`, `ReporteDto.cs`, `UpdateProyectoDto.cs`, `UsuarioDto.cs`, `ValidacionDto.cs`

These should be colocated with their respective feature folders (e.g., `Features/Projects/DTOs/ProyectoDto.cs`).

---

## 6. Dead Code & Stale Artifacts

| Item | Location | Status | Action |
|---|---|---|---|
| `UnitTest1.cs` | `Api.Tests/UnitTest1.cs` | 🔴 **DEAD** — empty test, no assertions | DELETE |
| `SwaggerTests.cs` | `Api.Tests/SwaggerTests.cs` | 🟡 **MISNAMED** — class is `ApiStatusTests` but file is `SwaggerTests.cs` | RENAME to `ApiStatusTests.cs` |
| Root `dist/` | `/dist/` | 🟡 **COMMITTED BUILD OUTPUT** | Add to `.gitignore` or delete |
| Root `package.json` | `/package.json` | 🔴 **STALE** — legacy, all unused deps | DELETE (if frontend is `src/frontend/web/`) |
| Root `vite.config.ts` | `/vite.config.ts` | 🔴 **STALE** — orphaned | DELETE |
| Root `index.html` | `/index.html` | 🔴 **STALE** — orphaned | DELETE |
| Root `tsconfig.json` | `/tsconfig.json` | 🔴 **STALE** — orphaned | DELETE |
| Root `pnpm-lock.yaml` | `/pnpm-lock.yaml` | 🔴 **STALE** — for root package.json | DELETE |
| Root `node_modules/` | `/node_modules/` | 🔴 **STALE** — from root install | DELETE |
| `package-lock.json` | `src/frontend/web/package-lock.json` | ⚠️ **CONFLICT** — project uses pnpm, but npm lockfile present | DELETE |
| `dist/` in frontend | `src/frontend/web/dist/` | 🟡 **BUILD OUTPUT** | Should be gitignored |
| `dist-node/` in frontend | `src/frontend/web/dist-node/` | 🟡 **BUILD OUTPUT** | Should be gitignored |
| `tsconfig.tsbuildinfo` | `src/frontend/web/tsconfig.tsbuildinfo` | 🟡 **BUILD CACHE** | Should be gitignored |

---

## 7. Email Service Architecture

> [!NOTE]
> Two separate email service layers exist by design:

| Service | Interface | Role |
|---|---|---|
| `ResendEmailService` / `MockEmailService` | `IEmailService` | Low-level: sends raw email via Resend SDK | Resend is the official one for the proyect keep
| `EmailNotificationService` | `IEmailNotificationService` | High-level: orchestrates domain notifications using `IEmailService` |

This is correct (Strategy + Facade pattern). However:

- `EmailNotificationService.SendCriticalAlertAsync()` contains a **`Task.Delay(100)` mock stub** that should be replaced with an actual implementation.
- The `EmailTestController.cs` (5,596 bytes) is DEBUG-only and acceptable for development.

---

## 8. Test Coverage Analysis

### 8.1 Backend Tests

| Location | Tests | Quality |
|---|---|---|
| `Api.Tests/` | 3 files (1 dead) | 🟡 Low — `UnitTest1.cs` is dead |
| `tests/backend/UnitTests/` | 7 files + 8 subdirectories | ✅ Good coverage |
| `tests/backend/IntegrationTests/` | 3 files | 🟡 Minimal |

### 8.2 Frontend Tests

| Location | Tests | Quality |
|---|---|---|
| `tests/frontend/` | 1 file (`HealthPage.test.tsx`) | 🔴 Very low |
| `pages/__tests__/` | 1 file (`LandingPage.test.tsx`) | 🔴 Very low |

> [!CAUTION]
> **Frontend test coverage is critically low.** Only 2 test files exist for 13 feature modules and 7+ pages. Prioritize testing for core flows: auth, projects, validations, documents.

---

## 9. CI/CD & DevOps Gaps

| Item | Status | Action |
|---|---|---|
| `.github/workflows/` | ❌ **MISSING** | Create CI pipeline (build, test, lint) |
| `.gitignore` coverage | 🟡 **PARTIAL** | Missing: `dist-node/`, `tsconfig.tsbuildinfo`, `*.log` is too broad |
| Docker configs | ✅ Present | 4 Dockerfiles (dev + prod for api + web) |
| `docker-compose.yml` | ✅ Present | Dev environment orchestration |

---

## 10. Domain Coverage Matrix

Based on entities, features, frontend modules, and controllers:

| Domain | Entity | Backend Feature | Controller | Frontend Feature | Status |
|---|---|---|---|---|---|
| Projects | ✅ `Proyecto` | ✅ `Projects` | ✅ `ProjectsController` | ✅ `projects` | ✅ COMPLETE |
| Documents | ✅ `Documento` | ✅ `Documents` | ✅ `ProjectDocumentsController` | ✅ `documents` | ✅ COMPLETE |
| Validations | ✅ `Validacion` | ⚠️ Split (`Validation`/`Validations`) | ✅ `ValidationController` | ✅ `validations` | 🟡 NAMING |
| Findings | ✅ `Hallazgo` | — | ✅ `FindingsController` | ✅ `findings` | 🟡 NO FEATURE |
| Reports | ✅ `Reporte` | ⚠️ Split (`Reports`/`Reportes`) | ✅ `ReportsController` | ✅ `reports` | 🟡 NAMING |
| Audit | ✅ `Auditoria` | ⚠️ Split (`Audit`/`Auditoria`) | ✅ `AuditController` | ✅ `audit` | 🟡 NAMING |
| Certifications | ✅ `Certificacion` | ✅ `Certifications` | ✅ `CertificationsController` | ✅ `certifications` | ✅ COMPLETE |
| Notifications | ✅ `Notificacion` | — | ✅ `NotificationsController` | ✅ `notifications` | 🟡 NO FEATURE |
| Users/Auth | ✅ `Usuario` | — | — | ✅ `auth` | 🟡 NO CONTROLLER |
| Consentimiento | ✅ `ConsentimientoFinanciero` | ✅ `Consentimiento` | ✅ `ConsentimientoController` | — | 🟡 NO FRONTEND |
| Credit | ✅ `ResultadoCrediticio` | ✅ `Credit` | ✅ `ConsultaCrediticiaController` | — | 🟡 NO FRONTEND |
| Sello | ✅ `SelloIntegridad` | ✅ `Sello` | ✅ `SelloIntegridadController` | — | 🟡 NO FRONTEND |
| Dashboard | — | — | — | ✅ `dashboard` | 🟡 FE ONLY |
| Rules | ✅ `ReglaValidacion` | ✅ `ReglasValidacion` | ✅ `ValidationRulesController` | ✅ `rules` | ✅ COMPLETE |
| Public | — | ✅ `PublicConsulta`/`PublicVerification` | ✅ 3 controllers | ✅ `public`/`public-verification` | ✅ COMPLETE |

---

## 11. Priority Action Items

### 🔴 Critical (Do First)

| # | Item | Impact |
|---|---|---|
| 1 | **Remove root legacy files** (`package.json`, `vite.config.ts`, `index.html`, `tsconfig.json`, `pnpm-lock.yaml`, `node_modules/`) | Eliminates confusion about canonical project location |
| 2 | **Remove `Resend` package from `Api.csproj`** | Clean dependency graph; already transitive via Infrastructure |
| 3 | **Delete `Api.Tests/UnitTest1.cs`** | Dead code |
| 4 | **Rename `SwaggerTests.cs` → `ApiStatusTests.cs`** | File name doesn't match class name |
| 5 | **Delete `package-lock.json` in `src/frontend/web/`** | Conflicts with pnpm lockfile |

### 🟠 High (This Sprint)

| # | Item | Impact |
|---|---|---|
| 6 | **Consolidate split feature folders** (`Audit`/`Auditoria`, `Reports`/`Reportes`, `Validation`/`Validations`) | Naming consistency, discoverability |
| 7 | **Create `.github/workflows/ci.yml`** | Automated build + test on PR |
| 8 | **Add frontend test coverage** | Only 2 tests for entire frontend |
| 9 | **Move loose DTOs into feature folders** | Enforce feature cohesion |

### 🟡 Medium (Next Sprint)

| # | Item | Impact |
|---|---|---|
| 10 | **Split monolithic pages** (`RulesManagePage.tsx`, `ProjectPublicDetailPage.tsx`) | Maintainability |
| 11 | **Implement `EmailNotificationService.SendCriticalAlertAsync()`** | Currently a mock stub |
| 12 | **Update `.gitignore`** to cover `dist-node/`, `tsconfig.tsbuildinfo` | Prevent committed build artifacts |
| 13 | **Create more ADRs** (only ADR-009 exists) | Document architecture decisions |
| 14 | **Create `AGENTS.md`** for domain coverage tracking | Standardize domain requirements |

---

*Generated by `/audit-chores` workflow — Antigravity AI*
