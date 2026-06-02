# AUDIT.md — VeriFinca Comprehensive Codebase Audit

> **Date:** 2026-06-02 | **Branch:** `develop` | **Auditor:** Antigravity Agent (Claude Opus 4.6)
> **Workflow:** `/audit-chores` · `/clean-code` · `/zeroize-audit`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository Structure Map](#2-repository-structure-map)
3. [Frontend Dependency Audit](#3-frontend-dependency-audit)
4. [Backend Dependency Audit (NuGet)](#4-backend-dependency-audit-nuget)
5. [Architecture Boundary Verification](#5-architecture-boundary-verification)
6. [Monolithic Files (>300 Lines)](#6-monolithic-files-300-lines)
7. [Domain Coverage & Naming Inconsistencies](#7-domain-coverage--naming-inconsistencies)
8. [Security Audit](#8-security-audit)
9. [JavaScript Removal Status](#9-javascript-removal-status)
10. [Test Suite Health](#10-test-suite-health)
11. [Action Items](#11-action-items)

---

## 1. Executive Summary

| Category | Status | Details |
|---|---|---|
| JavaScript Removal | ✅ CLEAN | 100% pure TypeScript frontend source. Legacy `vite.config.js` deleted. |
| Frontend Dependencies | ✅ CLEAN | All 11 runtime + 10 dev packages verified as used. |
| Backend Dependencies | ✅ CLEAN | All NuGet packages across 4 projects verified as used. |
| Architecture Boundaries | ⚠️ PARTIAL | Frontend↔Backend clean. Clean Architecture has 1 known DI wiring exception in `Program.cs`. |
| Monolithic Files | ⚠️ FLAGGED | 9 frontend files and 1 backend file exceed 300 lines. |
| Domain Naming | ⚠️ INCONSISTENT | Duplicate domain folders with mixed Spanish/English naming in backend Application layer. |
| Security (Secrets) | ✅ CLEAN | `.env` in `.gitignore`, not tracked. No hardcoded secrets in source. |
| Security (JWT Storage) | 🔴 VIOLATION | `localStorage` used for JWT tokens in `AuthContext.tsx`, `AuthService.ts`, `RulesManagePage.tsx`, `ReportExportPanel.tsx`. |
| Security (API Key Exposure) | ⚠️ WARNING | `GEMINI_API_KEY` exposed via Vite `define` in root `vite.config.ts` (client-side bundle). |
| Test Suite | ✅ ALL GREEN | Backend: 55 unit + 9 API integration. Frontend: 47 tests across 12 suites. |

---

## 2. Repository Structure Map

```
Anteproyecto-Verify/
├── .agents/                    # Agent configuration, workflows, skills, rules
│   ├── docs/                   # AGENTS.md, ARCHITECTURE.md, TRD, DESIGN.md
│   ├── rules/                  # git-conventions.md, security.md
│   ├── skills/                 # groq-autofix.js, playwright-skill/, quality-qa/
│   └── workflows/              # audit-chores.md, ci-autofix.md, etc. (14 workflows)
├── .github/workflows/          # ci.yml (3 jobs: backend, frontend, security)
├── src/
│   ├── backend/                # C# .NET 8 Clean Architecture
│   │   ├── Api/                # ASP.NET Core Web API (entry point)
│   │   │   ├── Controllers/    # 23 controllers
│   │   │   ├── Extensions/     # ServiceCollection + ApplicationBuilder
│   │   │   ├── Health/         # Health check endpoint
│   │   │   └── Middleware/     # Error handling, CORS, security headers
│   │   ├── Application/        # CQRS commands/queries, DTOs, services
│   │   │   ├── Features/       # 16 feature folders (Commands + Queries)
│   │   │   ├── Abstractions/   # Interface contracts
│   │   │   ├── Contracts/      # Cross-cutting contracts
│   │   │   └── DTOs/           # Data transfer objects
│   │   ├── Domain/             # Pure domain entities (18 entities), enums, value objects
│   │   ├── Infrastructure/     # EF Core, external services, email, storage, security
│   │   ├── Api.Tests/          # xUnit API integration tests (9 tests)
│   │   └── Tools/DbSeeder/     # Database seeding utility
│   └── frontend/web/           # React 19 SPA
│       ├── src/
│       │   ├── app/            # App shell component
│       │   ├── features/       # 15 feature folders (domain-driven)
│       │   ├── infrastructure/ # API client, mock data
│       │   ├── pages/          # Route-level page components
│       │   ├── router/         # React Router configuration
│       │   ├── shared/         # Shared components, context, hooks
│       │   └── styles/         # Global CSS
│       └── vite.config.ts      # Vite 6 configuration (TypeScript)
├── tests/backend/
│   ├── UnitTests/              # xUnit unit tests (55 tests)
│   └── IntegrationTests/       # xUnit integration tests
├── docker/                     # Docker configuration files
├── docker-compose.yml          # Docker Compose orchestration
└── AUDIT.md                    # ← This file
```

---

## 3. Frontend Dependency Audit

**Package file:** `src/frontend/web/package.json`

### Runtime Dependencies (11 packages)

| Package | Version | Status | Used In |
|---|---|---|---|
| `clsx` | ^2.1.1 | ✅ Used | `PortalSidebarNav.tsx`, `ProjectDocumentUploadPage.tsx`, `VerifySearchForm.tsx`, `VerificationResultCard.tsx`, `PublicVerificationBadge.tsx` |
| `framer-motion` | ^12.38.0 | ✅ Used | Multiple page components for animations |
| `lucide-react` | ^0.546.0 | ✅ Used | Icon components across features |
| `react` | ^19.0.0 | ✅ Used | Core framework |
| `react-dom` | ^19.0.0 | ✅ Used | Core rendering |
| `react-qr-code` | ^2.0.18 | ✅ Used | `VerificationResultCard.tsx`, `CertificationQr.tsx` |
| `react-router-dom` | ^7.0.0 | ✅ Used | Router configuration and page navigation |
| `tailwind-merge` | ^3.5.0 | ✅ Used | `VerificationResultCard.tsx`, `PublicVerificationBadge.tsx`, `VerifySearchForm.tsx` |
| `axios` | ^1.7.9 | ✅ Used | `infrastructure/api/client.ts` (HTTP client) |
| `i18next` | ^23.11.5 | ✅ Used | `i18n.ts` (internationalization core) |
| `react-i18next` | ^14.1.2 | ✅ Used | `HeroSection.tsx`, `PricingPage.tsx`, `LegalPage.tsx`, `setupTests.ts` |

### Dev Dependencies (10 packages)

| Package | Version | Status | Used In |
|---|---|---|---|
| `@tailwindcss/vite` | ^4.0.0 | ✅ Used | `vite.config.ts` plugin |
| `@testing-library/jest-dom` | ^6.4.0 | ✅ Used | Test matchers |
| `@testing-library/react` | ^16.0.0 | ✅ Used | Component rendering in tests |
| `@testing-library/user-event` | ^14.5.0 | ✅ Used | User interaction simulation |
| `@types/node` | ^22.14.0 | ✅ Used | Node.js type definitions |
| `@types/react` | ^19.0.0 | ✅ Used | React type definitions |
| `@types/react-dom` | ^19.0.0 | ✅ Used | ReactDOM type definitions |
| `@vitejs/plugin-react` | ^4.3.4 | ✅ Used | `vite.config.ts` plugin |
| `axios-mock-adapter` | ^2.1.0 | ✅ Used | `client.test.ts` (HTTP mocking) |
| `jsdom` | ^24.1.3 | ✅ Used | Test environment |
| `tailwindcss` | ^4.0.0 | ✅ Used | CSS framework |
| `typescript` | ~5.6.2 | ✅ Used | TypeScript compiler |
| `vite` | ^6.0.0 | ✅ Used | Build tool |
| `vitest` | ^2.1.0 | ✅ Used | Test runner |

**Result:** ✅ No unused frontend dependencies found.

---

## 4. Backend Dependency Audit (NuGet)

### Api.csproj

| Package | Version | Status |
|---|---|---|
| `Microsoft.AspNetCore.Diagnostics.HealthChecks` | 2.2.0 | ✅ Used — Health check endpoint |
| `AspNetCore.HealthChecks.SqlServer` | 8.0.0 | ✅ Used — SQL health probe |
| `Swashbuckle.AspNetCore` | 6.6.2 | ✅ Used — Swagger/OpenAPI UI |
| `Microsoft.EntityFrameworkCore.Design` | 8.0.2 | ✅ Used — EF Core migrations tooling |

### Application.csproj

| Package | Version | Status |
|---|---|---|
| `Microsoft.Extensions.DependencyInjection.Abstractions` | 8.0.0 | ✅ Used |
| `Microsoft.Extensions.Configuration.Abstractions` | 8.0.0 | ✅ Used |
| `Microsoft.Extensions.Configuration.Binder` | 8.0.0 | ✅ Used |

### Infrastructure.csproj

| Package | Version | Status |
|---|---|---|
| `Microsoft.EntityFrameworkCore.SqlServer` | 8.0.2 | ✅ Used — SQL Server provider |
| `Microsoft.EntityFrameworkCore.InMemory` | 8.0.2 | ✅ Used — In-memory provider for testing |
| `Microsoft.Extensions.Configuration.Abstractions` | 8.0.0 | ✅ Used |
| `Microsoft.Extensions.Options.ConfigurationExtensions` | 8.0.0 | ✅ Used |
| `QuestPDF` | 2024.3.4 | ✅ Used — PDF generation for seals/reports |
| `ClosedXML` | 0.102.2 | ✅ Used — Excel export functionality |
| `BCrypt.Net-Next` | 4.0.3 | ✅ Used — Password hashing |
| `Resend` | 0.5.1 | ✅ Used — Transactional email |

### Domain.csproj

No external NuGet packages. Pure domain layer. ✅ Correct per Clean Architecture.

**Result:** ✅ No unused backend dependencies found.

---

## 5. Architecture Boundary Verification

### Frontend ↔ Backend Boundary

| Check | Command Equivalent | Result |
|---|---|---|
| Frontend imports backend code | `grep -r "from.*backend/" src/frontend/` | ✅ 0 matches — CLEAN |
| Backend references frontend code | `grep -r "from.*frontend/" src/backend/ --include="*.cs"` | ✅ 0 matches — CLEAN |

### Clean Architecture Layers (Backend)

| Check | Result | Notes |
|---|---|---|
| Domain → any other layer | ✅ CLEAN | No `using Api`, `using Application`, or `using Infrastructure` in Domain |
| Application → Infrastructure | ✅ CLEAN | Application uses only abstractions, no Infrastructure references |
| Api → Infrastructure | ⚠️ EXCEPTION | `Program.cs` imports `Infrastructure.DependencyInjection` and `Infrastructure.Persistence` for DI wiring and DB seeding |

> [!NOTE]
> The `Program.cs` import of `Infrastructure.DependencyInjection` is the standard ASP.NET Core pattern for composition root wiring. This is an **accepted exception** per the ARCHITECTURE.md specification (§8): *"All interface-to-implementation bindings live in `VeriFinca.Infrastructure/DependencyInjection.cs` and are registered in `Program.cs`."*

---

## 6. Monolithic Files (>300 Lines)

### Frontend (9 files)

| File | Lines | Location | Recommendation |
|---|---|---|---|
| `RegisterPage.tsx` | 549 | `src/pages/auth/` | 🔴 HIGH — Extract form sections into sub-components |
| `i18n.ts` | 449 | `src/` | ⚠️ MED — Split translation resources into per-locale JSON files |
| `LegalPage.tsx` | 449 | `src/features/legal/pages/` | ⚠️ MED — Extract legal sections into separate components |
| `PricingPage.tsx` | 403 | `src/features/pricing/pages/` | ⚠️ MED — Extract pricing tiers into sub-components |
| `FeaturedProjectsSection.tsx` | 392 | `src/features/public/components/` | ⚠️ MED — Extract project card and carousel logic |
| `VerificationResultCard.tsx` | 359 | `src/features/public-verification/components/` | ⚠️ LOW — Complex but cohesive |
| `RulesManagePage.tsx` | 334 | `src/pages/admin/` | ⚠️ MED — Extract rule form and table into sub-components |
| `ProjectPublicDetailPage.tsx` | 322 | `src/pages/projects/` | ⚠️ LOW — Acceptable for a detail page |
| `mockProjects.ts` | 312 | `src/infrastructure/mock/` | ⚠️ LOW — Mock data, acceptable size |

### Backend (1 file)

| File | Lines | Location | Recommendation |
|---|---|---|---|
| `AppDbContextSeeder.cs` | 316 | `src/backend/Infrastructure/` | ⚠️ LOW — Seeder with structured sample data |

---

## 7. Domain Coverage & Naming Inconsistencies

### Frontend Feature Domains (15 directories)

`audit` · `auth` · `certifications` · `dashboard` · `documents` · `findings` · `legal` · `notifications` · `pricing` · `projects` · `public` · `public-verification` · `reports` · `rules` · `validations`

### Backend Application Feature Domains (16 directories)

`Audit` · `Auditoria` · `Auth` · `Certifications` · `Consentimiento` · `Credit` · `Documents` · `Projects` · `PublicConsulta` · `PublicVerification` · `ReglasValidacion` · `Reportes` · `Reports` · `Sello` · `Validation` · `Validations`

### ⚠️ Naming Inconsistencies Detected

| Issue | Backend Folders | Recommendation |
|---|---|---|
| Duplicate audit domain | `Audit/` (Queries) + `Auditoria/` (Commands) | Consolidate under `Audit/` |
| Duplicate reports domain | `Reports/` (Queries) + `Reportes/` (Commands) | Consolidate under `Reports/` |
| Duplicate validations domain | `Validation/` + `Validations/` | Consolidate under `Validations/` |
| Mixed language naming | `Consentimiento`, `ReglasValidacion`, `Sello`, `PublicConsulta` | Consider English equivalents: `Consent`, `ValidationRules`, `Seal`, `PublicQuery` |

### Domain Mapping (Frontend ↔ Backend)

| Frontend Feature | Backend Feature(s) | Status |
|---|---|---|
| `audit` | `Audit` + `Auditoria` | ⚠️ Split |
| `auth` | `Auth` | ✅ Aligned |
| `certifications` | `Certifications` + `Sello` | ⚠️ Partial overlap |
| `dashboard` | *(no dedicated backend)* | ✅ OK — aggregates from other domains |
| `documents` | `Documents` | ✅ Aligned |
| `findings` | *(mapped via Validation)* | ✅ OK |
| `legal` | *(no backend equivalent)* | ✅ OK — static content |
| `notifications` | *(no dedicated backend feature)* | ⚠️ Missing backend |
| `pricing` | *(no backend equivalent)* | ✅ OK — static content |
| `projects` | `Projects` | ✅ Aligned |
| `public` | `PublicConsulta` | ✅ Aligned |
| `public-verification` | `PublicVerification` | ✅ Aligned |
| `reports` | `Reports` + `Reportes` | ⚠️ Split |
| `rules` | `ReglasValidacion` | ✅ Aligned (different language) |
| `validations` | `Validation` + `Validations` | ⚠️ Split |

---

## 8. Security Audit

### 8.1 Secrets Management

| Check | Result |
|---|---|
| `.env` listed in `.gitignore` | ✅ Yes — line 11 |
| `.env` tracked by Git | ✅ No — `git ls-files .env` returns empty |
| Hardcoded `GROQ_API_KEY` / `JWT_SECRET` / `MONGO_URI` in source | ✅ None found |
| CI/CD secrets via `${{ secrets.* }}` | ✅ Not applicable (no secrets referenced in `ci.yml`) |

### 8.2 JWT Storage

| Check | Result | Files |
|---|---|---|
| `localStorage` used for tokens | 🔴 VIOLATION | `AuthContext.tsx:42,53`, `AuthService.ts:106,113`, `RulesManagePage.tsx:41,55,67`, `ReportExportPanel.tsx:20` |

> [!CAUTION]
> **Security Rule Violation:** The `security.md` rule states: *"Tokens must be stored in `httpOnly` cookies. Never store JWT in `localStorage` or `sessionStorage`."*
> 
> The codebase stores JWT tokens in `localStorage` under the key `vf_token` (in `AuthContext.tsx` and `AuthService.ts`) and `token` (in `RulesManagePage.tsx` and `ReportExportPanel.tsx`).
> 
> **Remediation:** Migrate JWT storage to `httpOnly` secure cookies set by the backend. This requires a backend change to set `Set-Cookie` headers on login/refresh responses.

### 8.3 API Key Exposure

| Check | Result |
|---|---|
| `GEMINI_API_KEY` in client bundle | ⚠️ WARNING — Exposed via Vite `define` in root `vite.config.ts:12` |
| Usage in frontend source | ✅ Not referenced in `src/frontend/web/src/` |

> [!WARNING]
> The root `vite.config.ts` injects `GEMINI_API_KEY` into the client-side bundle via `define`. While the key is not currently consumed by any frontend code, this pattern exposes the secret to anyone inspecting the JavaScript bundle. Remove the `define` block or proxy API calls through the backend.

### 8.4 `@[current_problems]` Analysis

All security warnings reported in `@[current_problems]` are located exclusively in third-party dependency files under `node_modules/.pnpm/`:

- **`axios`** — Bracket notation in internal HTTP adapter code
- **`axios-mock-adapter`** — Bracket notation in mock response handling

**Assessment:** No Prototype Pollution risk exists in our application source code. All bracket notation usage in our codebase is statically typed (array indexing, record lookups with known keys). The dependency warnings are managed by package version upgrades, not source patching.

---

## 9. JavaScript Removal Status

| Category | Files Found | Status |
|---|---|---|
| Frontend source (`src/frontend/web/src/`) | 0 `.js`/`.jsx` files | ✅ 100% TypeScript |
| Vite configuration | `vite.config.ts` (was `.js`) | ✅ Migrated |
| Build outputs (`dist/`, `dist-node/`) | Compiled `.js` files | ✅ Expected — generated artifacts |
| Agent scripts (`.agents/skills/`) | `groq-autofix.js`, `playwright-skill/` | ✅ Agent tooling — not application code |
| Root configuration | `vite.config.ts`, `tsconfig.json` | ✅ Pure TypeScript |

**Result:** ✅ Zero JavaScript in application source code. Migration complete.

---

## 10. Test Suite Health

### Backend Tests

| Suite | Project | Tests | Status | Duration |
|---|---|---|---|---|
| Unit Tests | `tests/backend/UnitTests/` | 55 | ✅ All Passed | 168ms |
| API Integration | `src/backend/Api.Tests/` | 9 | ✅ All Passed | 2s |
| **Total** | | **64** | **✅ All Passed** | |

### Frontend Tests

| Suite | Tests | Status |
|---|---|---|
| `publicVerificationApi.test.ts` | 9 | ✅ Passed |
| `client.test.ts` | 16 | ✅ Passed |
| `ProjectForm.test.tsx` | 2 | ✅ Passed |
| `PricingPage.test.tsx` | 1 | ✅ Passed |
| `LegalPage.test.tsx` | 1 | ✅ Passed |
| `ProjectDocumentUploadPage.test.tsx` | 3 | ✅ Passed |
| `RegisterPage.test.tsx` | 1 | ✅ Passed |
| `VerifySearchForm.test.tsx` | 5 | ✅ Passed |
| `ProjectPublicDetailPage.test.tsx` | 1 | ✅ Passed |
| `LandingPage.test.tsx` | 2 | ✅ Passed |
| `FeaturedProjectsSection.test.tsx` | 4 | ✅ Passed |
| `ProjectsPublicListPage.test.tsx` | 2 | ✅ Passed |
| **Total** | **47** | **✅ All Passed** |

### Test Warnings (non-blocking)

- `ProjectForm.test.tsx` — Missing `act()` wrapper for state updates
- `RegisterPage.test.tsx` — Framer Motion `whileHover`/`whileTap` props on DOM elements
- `LandingPage.test.tsx` — Framer Motion `whileInView` prop on DOM elements

---

## 11. Action Items

| Priority | Domain | Action | Effort |
|---|---|---|---|
| 🔴 HIGH | Security | Migrate JWT from `localStorage` to `httpOnly` cookies | Medium |
| 🔴 HIGH | Security | Remove `GEMINI_API_KEY` from Vite `define` block | Low |
| ⚠️ MED | Architecture | Consolidate duplicate backend feature folders (`Audit`/`Auditoria`, `Reports`/`Reportes`, `Validation`/`Validations`) | Medium |
| ⚠️ MED | Code Quality | Split `RegisterPage.tsx` (549 lines) into sub-components | Medium |
| ⚠️ MED | Code Quality | Extract `i18n.ts` translation resources into per-locale JSON files | Low |
| ⚠️ MED | Code Quality | Split `LegalPage.tsx` and `PricingPage.tsx` into sub-components | Low |
| ⚠️ LOW | Naming | Standardize backend feature folder naming to English | Low |
| ⚠️ LOW | Testing | Add `act()` wrappers in `ProjectForm.test.tsx` | Trivial |
| ⚠️ LOW | Backend | Add dedicated `Notifications` backend feature module | Medium |

---

*Generated by `/audit-chores` workflow execution. Last verified: 2026-06-02T04:30:00Z.*
