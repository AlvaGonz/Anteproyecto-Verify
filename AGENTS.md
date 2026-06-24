# AGENTS.md — Verifinca / Anteproyecto-Verify

## Project overview

Monorepo with two independent stacks:

| Stack | Location | Tech |
|-------|----------|------|
| Backend API | `src/backend/` | ASP.NET Core 8, Clean Architecture |
| Frontend web | `src/frontend/web/` | React 19, TypeScript, Vite 6, Tailwind 4 |

**Backend layers** (dependency order): `Domain` → `Application` → `Infrastructure` → `Api`

**Frontend entrypoint**: `src/frontend/web/src/main.tsx`

---

## Quick start

### Docker (recommended for full stack)

```bash
# Copy .env (already exists, but verify contents)
# Start all services
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

### Frontend-only (no Docker)

```bash
cd src/frontend/web
pnpm install
pnpm run dev          # starts on port 3000
```

---

## Package manager

- **pnpm** (v9+) — workspace root has `pnpm-workspace.yaml` pointing to `src/frontend/web`
- Lockfile: `pnpm-lock.yaml` at root
- Install: `pnpm install --frozen-lockfile` (CI) or `pnpm install` (dev)
- The root `package.json` has scripts that run Vite from root context

---

## Testing

### Frontend (Vitest)

```bash
cd src/frontend/web
pnpm run test                    # all tests (vitest run)
pnpm exec vitest --run src/pages/auth/__tests__/RegisterPage.test.tsx  # single file
pnpm exec vitest                 # watch mode
```

**Vitest quirks**:
- Uses `pool: 'threads'` (not `forks`) — `forks` causes EPERM on Windows
- Environment: `jsdom`
- Setup file: `src/setupTests.ts` (mocks `react-i18next`)
- `@testing-library/react` + `@testing-library/jest-dom` available
- `axios-mock-adapter` available for HTTP mocking

### Backend (xUnit)

```bash
# Unit tests
dotnet test tests/backend/UnitTests/UnitTests.csproj

# Integration tests
dotnet test tests/backend/IntegrationTests/IntegrationTests.csproj

# API tests
dotnet test src/backend/Api.Tests/Api.Tests.csproj

# Single test with filter
dotnet test tests/backend/UnitTests/UnitTests.csproj --filter "FullyQualifiedName~ValidarTerritorio"
```

**Backend test quirks**:
- Uses xUnit + Moq + NetArchTest.Rules
- CI runs with `--filter "Category!=Integration"` to skip integration tests
- Integration tests require SQL Server (Docker)

### E2E (Playwright)

```bash
# From root
pnpm exec playwright test e2e/auth/          # auth tests
pnpm exec playwright test e2e/projects/      # frontend tests
pnpm exec playwright test e2e/api/           # API tests
```

**Playwright quirks**:
- Config at root `playwright.config.ts`
- Three projects: `api`, `auth`, `frontend`
- `fullyParallel: false`, `workers: 1` — tests run sequentially
- Global setup: `e2e/global-setup.ts`
- Web server auto-starts Vite on port 5173 for frontend tests
- Report output: `playwright-report/` (HTML)
- Screenshots on failure, video on failure, trace on first retry

---

## CI pipeline (GitHub Actions)

File: `.github/workflows/ci.yml`

| Job | What it does |
|-----|-------------|
| `backend` | Restore → Build all 6 csproj files → Unit tests → Integration tests → Api.Tests |
| `frontend` | pnpm install → tsc --noEmit → RegisterPage smoke test → Playwright CRUD test → Vite build |
| `security` | Scans git history for leaked Resend API keys |
| `e2e-tests` | Depends on backend + frontend → Runs Playwright auth tests |

**CI quirks**:
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'` in env
- Frontend tests run with `VITE_USE_MOCK: 'true'`
- E2E tests run with `ASPNETCORE_ENVIRONMENT: Development`
- Playwright installs only Chromium: `pnpm exec playwright install --with-deps chromium`

---

## Build & type checking

```bash
# Frontend build (tsc -b && vite build)
cd src/frontend/web && pnpm run build

# TypeScript check only (no emit)
pnpm exec tsc --noEmit

# Lint
pnpm run lint
```

**TypeScript quirks**:
- Root `tsconfig.json` has `@/*` → `./*` (root-relative)
- Frontend `tsconfig.json` has `@/*` → `src/*` (frontend-relative)
- Frontend uses `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- Root tsconfig includes `stitch_verifinca_real_estate_validation/` files (external reference)

---

## Database

- SQL Server via Docker (`docker-compose.yml`)
- EF Core 8 with SQL Server provider
- Auto-creates tables on dev startup (`Program.cs` has resilience loop: 30 retries, 2s delay)
- Seeder: `AppDbContextSeeder.SeedAsync()` runs on dev startup
- Migration command (if needed):
  ```bash
  cd src/backend
  dotnet ef migrations add <Name> --project Infrastructure/Infrastructure.csproj --startup-project Api/Api.csproj --output-dir Persistence/Migrations
  ```
- DbSeeder tool: `src/backend/Tools/DbSeeder/`

---

## Environment

- Root `.env` file loaded by Docker Compose
- Frontend env files: `src/frontend/web/.env.development`, `.env.staging`, `.env.production`
- Frontend Vite config uses `loadEnv(mode, '.', '')` from root
- Key vars: `VITE_API_URL`, `VITE_USE_MOCK`, `ConnectionStrings__DefaultConnection`, `Jwt__*`, `GROQ_API_KEY`, `RESEND__APITOKEN`

---

## Architecture notes

- **Clean Architecture**: Domain has zero dependencies, Application depends on Domain, Infrastructure depends on Application, Api depends on Infrastructure
- **CQRS-like**: Handlers in Application layer (e.g., `ValidarTerritorioHandler`, `EmitirSelloHandler`, `GetDocumentDiagnosisQueryHandler`)
- **FluentValidation** for request validation
- **JWT auth** with `Microsoft.AspNetCore.Authentication.JwtBearer`
- **QuestPDF** for PDF report generation, **ClosedXML** for Excel
- **Resend** for email, **BCrypt.Net-Next** for password hashing
- **Azure Blob Storage** (Azurite for local dev)
- **DGII validation** service for Dominican Republic tax authority data

---

## Pre-commit hooks

- `.pre-commit-config.yaml` runs `agent-firewall` hook (Python script at `.agents/scripts/post_task_loop.py`)
- Triggers on `.py`, `.js`, `.ts` files

---

## Other config files

| File | Purpose |
|------|---------|
| `.editorconfig` | Editor settings |
| `.npmrc` | npm/pnpm config |
| `.gitignore` | Git ignore rules |
| `.dockerignore` | Docker build context ignore |
| `Directory.Build.props` | Shared MSBuild properties |
| `.semgrepignore` | Semgrep SAST ignore |
| `.securecoder.ignore` | SecureCoder ignore |
| `reviewdog.json` | Reviewdog config |
| `Dangerfile` | Danger CI checks |
| `.trunk/trunk.yaml` | Trunk.io config |
| `.waza.yaml` | Waza AI config |