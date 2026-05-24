# Task Plan: Audit Cleanup — 5 Critical Items

## Goal
Execute the 5 critical cleanup items from AUDIT.md (2026-05-24) without breaking builds or tests. Each item is atomic with a build gate before continuing.

---

## Phases

### Phase 1: Root Monorepo & Script Delegation
- [x] Delete orphaned root files: `vite.config.ts`, `index.html`, `tsconfig.json`
- [x] Clean up root `package.json` and delegate scripts to `web-frontend`
- [x] Run `pnpm install` at root to regenerate monorepo state
- [x] **Gate**: Root `pnpm run build` succeeds
- **Status:** completed

### Phase 2: Remove Redundant Resend Reference
- [x] Remove `Resend` PackageReference from `src/backend/Api/Api.csproj`
- [x] **Gate**: `dotnet build src/backend/` succeeds
- **Status:** completed

### Phase 3: Delete Dead UnitTest1.cs
- [x] Delete `src/backend/Api.Tests/UnitTest1.cs`
- [x] **Gate**: `dotnet test src/backend/` succeeds
- **Status:** completed

### Phase 4: Rename SwaggerTests.cs
- [x] Rename `src/backend/Api.Tests/SwaggerTests.cs` to `src/backend/Api.Tests/ApiStatusTests.cs`
- [x] **Gate**: `dotnet test src/backend/` succeeds
- **Status:** completed

### Phase 5: Remove conflicting package-lock.json & Update .gitignore
- [x] Delete `src/frontend/web/package-lock.json`
- [x] Update `.gitignore` with frontend build caches (`dist-node/`, `tsconfig.tsbuildinfo`)
- [x] **Gate**: `pnpm run build` still succeeds
- **Status:** completed

---

## Constraints
- NO business logic modifications
- NO files outside each step's scope
- Build gate between each step
- One commit per item
