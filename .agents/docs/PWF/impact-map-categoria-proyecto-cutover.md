# Impact Map — CategoriaProyecto Cutover (Remove Hardcoded Project Categories)

> **Date:** 2026-08-02 | **Branch:** feat (head `0d4e6fd2`) | **Status:** Discovery complete
> **Objective:** All project-category data flows exclusively from the `CategoriaProyecto` table via `CategoriaId`; no enum, no legacy display strings, no legacy magic IDs.

## 1. Canonical data (source of truth)

`CategoriaProyecto` table — **16 rows, all `Activo = 1`** (verified in local DB):

| Id | Nombre | Notes |
|----|--------|-------|
| 1 | ALBERGUES | |
| 2 | ALMACENES | |
| 3 | APARTAMENTOS | seeder uses 3 |
| 4 | CENTROS DE RECREACIÓN Y DEPORTES | |
| 5 | CENTROS DE SALUD | |
| 6 | COLEGIOS Y CENTROS EDUCATIVOS | |
| 7 | COMBINADOS | legacy Mixto → 7 |
| 8 | COMERCIAL Y OFICINAS | legacy Comercial → 8 |
| 9 | DEPÓSITOS | |
| 10 | ESTACIÓN DE COMBUSTIBLE | |
| 11 | ESTRUCTURAS ESPECIALES | legacy Otro → 11 |
| 12 | HOSPEDAJE | legacy Turístico → 12 |
| 13 | OBRAS DE ORDEN SOCIAL | |
| 14 | PARQUEOS | |
| 15 | SERVICIOS DE TRANSPORTE | |
| 16 | VIVIENDAS | legacy Residencial → 16 |

**Legacy mapping (from migration `20260802035457_NormalizeProjectCategories`):** Residencial(1)→16, Comercial(2)→8, Turístico(3)→12, Mixto(4)→7, Otro(99)→11. Note: legacy `Industrial(5)` had no DB representation; no mapping needed.

## 2. Already completed upstream (do not redo)

- `src/backend/Domain/Enums/ProjectCategory.cs` — **deleted** (`ead485df`).
- `Proyecto.Categoria` → `CategoriaId` (int) + `CategoriaProyecto` nav (`ce7b8df4`, `ead485df`).
- DTOs: `ProyectoDto(CategoriaId, CategoriaNombre)`, `CreateProyectoDto.CategoriaId`, `UpdateProyectoDto.CategoriaId`.
- Backend endpoint `GET /api/projects/categories` (`[HttpGet("categories")]`, `[AllowAnonymous]`) → `CategoriaProyectoDto(Id, Nombre, Descripcion)` via `GetCategoriasQueryHandler` → `IProyectoRepository.GetCategoriasAsync` (filters `Activo`, orders by Id).
- DB seed: migration INSERT 16 rows + `AppDbContextSeeder` uses real IDs (3, 16, 12, 8).
- `RequiredDocumentsPolicy.GetRequiredDocumentsForCategory` already special-cases real IDs 8, 12, 7.
- Frontend `useCategories()` hook (queryKey `project-categories`, 24h staleTime) + `ProjectFormBasicFields` select renders from `categorias` prop.

## 3. Remaining hardcoded references (impact inventory)

### 3.1 Backend — test fixtures (compile errors, ~34)
`ProjectCategory.*` still referenced in 14 files — these are the RED build state:

- `tests/backend/UnitTests/ProjectServiceTests.cs` — ctor arg + `Assert.Equal(ProjectCategory.Comercial, result.Categoria)` (3×)
- `tests/backend/UnitTests/DocumentServiceTests.cs` — `new Proyecto(..., ProjectCategory.*)` (4×)
- `tests/backend/UnitTests/CatastroComparisonServiceTests.cs` — ctor + `UpdateDetails` (6×)
- `tests/backend/UnitTests/Application/ProjectServiceQuotaTests.cs` — `MakeDto` (1×)
- `tests/backend/UnitTests/Validacion/ValidarTerritorioHandlerTests.cs` — `UpdateDetails` (2×)
- `tests/backend/UnitTests/Api/Controllers/ProjectsControllerTests.cs` — `ProyectoDto` ctor arg + ctor now needs `IMediator` (6th dep)
- `tests/backend/UnitTests/Api/Controllers/PublicProjectConsultationQuotaTests.cs` — `ProyectoDto(Categoria: ...)` named arg
- `tests/backend/UnitTests/Application/Features/Validations/InternalValidationEngineTests.cs` — ctor arg
- `tests/backend/UnitTests/.../ProjectDocumentsSecurityApiTests.cs`, `QuotaIntegrationTests.cs` — compile refs
- `src/backend/Tests/Integration/{PublicSealVerificationTests,ExternalApiMockingTests,SealIssuanceTests(2×),Settings/DeleteUserTests}.cs` — ctor args

**Fix:** map per §1; `result.Categoria` → `result.CategoriaId` (+ `CategoriaNombre` where asserted); `ProyectoDto(Categoria: X)` → `CategoriaId: 16, CategoriaNombre: "VIVIENDAS"`; add `IMediator` mock to `ProjectsControllerTests` ctor.

### 3.2 Backend — behavior gaps (not yet implemented)
- `ProjectService.CreateProjectAsync` / `UpdateProjectAsync` do **not** validate `CategoriaId` — must reject IDs not present and `Activo=1` in `CategoriaProyecto` (controller maps `ArgumentException` → 400 with `field`).
- `CreateProyectoDto.CategoriaId = 1` default and `Proyecto` ctor `categoriaId = 1` default — hardcoded category refs; make required.
- `Api.Tests/Projects/ProjectServiceTests.cs` — numeric IDs already (2, 1); needs `GetCategoriasAsync` mock setup once validation lands.

### 3.3 Frontend
- `src/frontend/web/src/features/projects/hooks/useProjectForm.ts:85` — `useState<number>(initialData?.categoriaId ?? 16) // 16 = VIVIENDAS` — **hardcoded default must go**; default = first category from `useCategories()`.
- `src/frontend/web/src/features/documents/requirementCatalog.ts` — `CATEGORY_REQUIREMENTS` keyed by **legacy IDs** {1: Residencial, 2: Comercial, 3: Turistico, 4: Mixto, 5: Industrial, 99: Otro} → must be {16: VIVIENDAS, 8: COMERCIAL Y OFICINAS, 12: HOSPEDAJE, 7: COMBINADOS} (5/99 drop; default `[]`).
- `src/frontend/web/src/features/documents/__tests__/requirementCatalog.test.ts` — asserts legacy IDs 1,2,3,4,99 → real IDs.
- `src/frontend/web/src/pages/projects/__tests__/ProjectManagePage.unit.test.tsx:276` — `categoria: 1` stale field name.
- Display pages use `project.categoriaNombre` (already API-sourced) — no change.

### 3.4 E2E fixtures (legacy magic numbers)
~15 specs under `e2e/projects/` use `categoria: N` (1=Residencial, 2=Comercial, 3=Turistico):
category-requirements, create-project, certificacion-ipi-ocr, estado-juridico-dropdown-regression, ocr-cedula-extraction, plano-mensura-*, project-crud, project-photos, project-search, validation, etc.
**Fix:** field → `categoriaId`, values → real IDs per §1; mock response bodies `categoria: N` → `categoriaId` + `categoriaNombre`.

### 3.5 Seed / SQL scripts (verify only)
- `src/backend/Tools/DbSeeder/Scripts/14_Proyectos_Realistas.sql` — `CategoriaId` values verified ∈ [1..16] (66 INSERTs) ✓ no change.
- `Build-Database-Sql.sql` — contains CREATE + mapping UPDATE + FK; `[Categoria]` at L110 is the legacy column renamed via `sp_rename` (L1331); `nvarchar(100)` at L584 belongs to DGII table (unrelated). No change.
- `.Designer.cs` migration snapshots keep historical `Categoria` (string/int) — do **not** touch.

### 3.6 Docs
- `.agents/docs/VerificationMatrix.md` L8-9 — mentions `ProjectCategory` → update.
- `docs/` — no category references (`perf-baseline.md`, `perf-results.md` clean).

## 4. Regression guard (new)
- Grep sweep test (vitest, repo-root walk): fail on `\bProjectCategory\b` token anywhere; fail on `categoria:` field in `e2e/`. Allowlist: migrations (`.Designer.cs` snapshots), `Build-Database-Sql.sql`, `14_Proyectos_Realistas.sql`, the sweep test itself. Wired into `.github/workflows/ci.yml` (frontend job).
- Backend unit test: `GetCategoriasQueryHandler` returns exactly the 16 seeded rows (id/nombre), ordered.
- Frontend unit test: category select defaults to first API-sourced category (not 16); select options render from `useCategories` mock data.
- Backend validation tests: create/update reject unknown `CategoriaId`, accept active one (service-level, mock repo).

## 5. Execution order (test-first per consumer)
1. Seed verify — DONE (16 rows, `Activo=1`, SQL scripts clean).
2. This impact map — DONE.
3. Failing tests: regression sweep (RED: 14 files + docs), catalog tests on real IDs (RED), `useProjectForm` default test (RED), `GetCategoriasQuery` 16-rows (GREEN guard), validation tests (RED).
4. Backend: fix fixtures to compile, add `CategoriaId` validation, drop DTO/entity defaults. Commit.
5. Frontend: default from API, migrate `requirementCatalog` + tests. Commit.
6. E2E fixtures → real IDs. Commit.
7. Verify: builds, all suites, sweep green, docs, `progress.md`, `post_task_loop.py`. Commit.
