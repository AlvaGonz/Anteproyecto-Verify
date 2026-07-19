| Additional Project Images (5 columns) — Migration, API endpoints, Frontend hooks & UI, Unit Test Fixes   | RF-2, OE-1  | ExpedienteRebuild                                    | 2d6adabf   | 2026-07-13 |
| Corporate Invite Users Flow (Invitacion entity, SettingsController, UI Modal) | N/A | develop | (pending) | 2026-07-12 |
| Fix Admin Dashboard Stats 403 & potential-invitees 404 | N/A | develop | (pending) | 2026-07-12 |
| Corporate Invitee Confirmation Modal (Null Limits warning) | N/A | develop | (pending) | 2026-07-13 |
| Fix Guest Initial Status marking "Activo" before login | N/A | develop | (pending) | 2026-07-13 |
| Corporate Invitee Deletion Confirmation Modal | N/A | develop | (pending) | 2026-07-13 |
## 🔄 In Progress
| Feature | TRD Section | Status | Blocker |
| ------- | ----------- | ------ | ------- |
| Document Ingestion Foundation (Azurite, OCR Stub, State Engine) | N/A | 100% | None |


## 🔜 Next Up (Prioritized)
1. Verify consent test passes in CI pipeline

## ⚠️ Open Decisions (Human-in-the-Loop Required)
- Human action required: confirm schema via MCP before proceeding with EF Core migrations.

## 🚫 Known Constraints
- None

---

## 📋 QA Backlog (from To-do.txt)
| Priority         | Count | Items                                         |
| ---------------- | ----- | --------------------------------------------- |
| 🔴 P0 — Critical  | 6     | WBS-001..006 — Routes rotas + E2E tests       |
| 🟠 P1 — High      | 8     | WBS-007..014 — Security, Compliance, 17 UIs   |
| 🟡 P2 — Medium    | 5     | WBS-015..019 — UX mejoras                     |
| 🟢 P3 — Tech Debt | 10    | TEC-001..010 — Accesibilidad, rendimiento, CI |

## 🔄 In Progress (QA Roadmap — ORCH-TEST-001 Proof)
| WBS     | Item                            | Agent                | Status                  |
| ------- | ------------------------------- | -------------------- | ----------------------- |
| WBS-001 | RegisterPage test               | tdd-guide            | ✅ 257 lines, 11 tests   |
| WBS-005 | TC-002 coordinates diagnosis    | build-error-resolver | ✅ Diagnosis report      |
| WBS-007 | JWT localStorage audit          | security-reviewer    | ✅ SEC-001 surfaced      |
| WBS-009 | Bundle optimization             | refactor-cleaner     | ✅ Analysis report       |
| WBS-012 | Password policy xUnit test      | tdd-guide            | ✅ 6 theory/2 fact tests |
| WBS-013 | Consent gate audit (Law 172-13) | ley172-13-auditor    | ✅ COMP-001 surfaced     |
| WBS-014 | 17 UI screens breakdown         | planner              | ✅ 17 screens mapped     |
| WBS-020 | RF-10 Integrity Seal ADR        | architect            | ✅ ADR-005 (357 lines)   |
| TEC-010 | SonarCloud pipeline gate        | devops-specialist    | ✅ Pipeline config       |
| WBS-022 | Invitation Limits E2E Tests     | playwright-skill     | ✅ 08-invitation-limits  |

## ⚠️ Open Decisions (Human-in-the-Loop Required)
- [x] JWT migration from localStorage to HttpOnly cookies (SEC-001) — surfaced in ORCH-TEST-001 (DONE - Security Hardening)
- [x] TransUnion consent gate verification (COMP-001) — surfaced in ORCH-TEST-001 (DONE)
- [ ] Set GROQ_API_KEY environment variable — all 8 subagents return empty without it (ROOT CAUSE)
- [x] Create missing agent files: BatchExecutor.md, DocWriter.md (DONE)
- [x] ADR-006: SEC-001 JWT cookie migration plan (PHASED, APPROVAL REQUIRED)
- [x] ADR-007: COMP-001 TransUnion consent gate plan (IMPLEMENTED — version check + tests)
  - `ConsentGateConstants.CurrentVersionPolitica = "v1.0"` (Application.Common)
  - `ConsultarCreditoCommandHandler` blocks TransUnion if version mismatch
  - `VerificarConsentimientoVigenteQueryHandler` returns false if version mismatch
  - Test: `CreditCheck_ConsentVersionMismatch_BlocksTransUnion`
- [ ] Public endpoint changes for Precios page (BUG-005)

## 🔄 Expanded Scope (Post-Audit — 2026-06-29)
| New ID  | Item                                     | Priority | RF    | OE      |
| ------- | ---------------------------------------- | -------- | ----- | ------- |
| WBS-020 | Sello Digital endpoint + QR (Law 126-02) | P1       | RF-10 | OE-7    |
| WBS-021 | Documentary Diagnosis UI + Rules Engine  | P1       | RF-2  | OE-1    |
| TEC-011 | DataRetentionPurgeJob (30d/90d/7yr)      | P3       | RNF-5 | OE-6    |
| TEC-012 | Availability monitoring + health checks  | P3       | RNF-3 | General |
| TEC-013 | Load testing target with k6              | P3       | RNF-4 | General |

**Audit findings resolved:** RF-2 gap, RF-10 gap, RNF-3/4/5 gaps, PERF-001 reclassified P1, OE traceability corrected, "47 requisitos" source clarified.

> Updated: 2026-06-29T20:30:00-04:00 by DocWriter v1.0 (Post-Audit Patch — +5 items, 34 total)

## 🐛 Resolved Bugs
- **BUG-007:** 404 Not Found on `/api/auth/resend-verification`.
  - **Symptom:** The new frontend `useResendVerificationEmail` mutation failed with `404 Not Found` despite the backend having the endpoint correctly implemented.
  - **Root Cause:** `dotnet watch` inside the Docker container failed to hot-reload and compile the newly added `ResendVerificationEmail` namespace. The `Api` container was still running the older version without the endpoint mapped.
  - **Fix:** Fixed by manually executing `dotnet build` inside the container or forcing a restart of the container to pick up the new files properly, which successfully compiled the `Api` layer.
- **BUG-006:** HashRouter + Stripe `return_url` incompatibility. 
  - **Symptom:** `session_id` persists in URL after hard reset on checkout return page.
  - **Root Cause:** Stripe redirects to a regular URL which HashRouter misinterprets, preventing `CheckoutReturnPage` from routing and maintaining `session_id` in the real search params.
  - **Fix:** Fixed backend `return_url` to include `/#/`, added `window.location.search` fallback and `sessionStorage` idempotency guard in `CheckoutReturnPage.tsx`.
  - **Commit:** 507891d3
- **BUG-007:** User session leakage/crossover on login.
  - **Symptom:** When logging in, the user sees data from a previous session or another user.
  - **Root Cause:** React Query cache (`queryClient`) was not being cleared on login or logout, leading to old data persisting in the client.
  - **Fix:** Used TDD to add `queryClient.clear()` in `AuthContext.tsx` on `login`, `logout`, and `auth:force-logout` events.
- **BUG-008:** Local API process binding intercepting Docker traffic.
  - **Symptom:** Login returns 500 Internal Server Error, and create-session returns 400.
  - **Root Cause:** A local dotnet run instance (task-1227) was binding to port 5000 on the host, intercepting traffic meant for the Docker container. It used the Production environment and attempted Windows Authentication against SQLEXPRESS, failing silently due to log level settings.
  - **Fix:** Killed the rogue local process, restoring traffic to the Docker container.
- **BUG-009:** Stripe API ArgumentException masked as 400 Bad Request.
  - **Symptom:** Missing Stripe Secret Key causes the `/v1/subscriptions/session-status` endpoint to return `400 Bad Request` instead of `500 Internal Server Error`, misleading the frontend error handling.
  - **Root Cause:** `StripeConfiguration.ApiKey` was null/empty. When `SessionService.GetAsync()` was called, the Stripe SDK threw an `ArgumentException` directly (bypassing `catch (StripeException e)`). `GlobalExceptionHandler` caught the `ArgumentException` and incorrectly transformed it to `400 Bad Request`.
  - **Fix:** Added an explicit missing configuration check inside `GetSessionStatus` to return `500 Internal Server Error` before any Stripe API code is invoked. TDD test added.
- **BUG-010:** E2E Tests failing due to stuck loading states and missing package.json scripts.
  - **Symptom:** `pnpm run test:e2e` fails or hangs, and the `test:e2e` script was missing. `diagnosis-ui.spec.ts` and `project-photos.spec.ts` fail due to timeout waiting for UI elements.
  - **Root Cause:** The `package.json` was missing the `test:e2e` script. The E2E tests for `diagnosis-ui` and `project-photos` did not mock the `**/api/auth/refresh` and `**/api/notifications*` routes, causing the app to hang in a loading state or fail to load data, leading to Playwright timeouts.
  - **Fix:** Added `"test:e2e": "playwright test"` to `package.json`. Added the missing API mocks to the `beforeEach` hooks of both failing test files. Tests now pass.
- **BUG-011:** Duplicate Stripe integration fields causing CS0102 compilation error.
  - **Symptom:** `dotnet watch` fails with `CS0102: The type 'Usuario' already contains a definition for 'StripeCustomerId'` (and others).
  - **Root Cause:** A bad merge duplicated the `StripeCustomerId`, `StripeSubscriptionId`, `SubscriptionStatus`, and `CurrentPeriodEnd` fields in `Usuario.cs`.
  - **Fix:** Removed the duplicated fields from `Usuario.cs`.
- **BUG-012:** Missing ConcurrentDictionary namespace causing CS0246 compilation error.
  - **Symptom:** `dotnet watch` fails with `CS0246: The type or namespace name 'ConcurrentDictionary<,>' could not be found` in `AuthController.cs`.
  - **Root Cause:** Missing `using System.Collections.Concurrent;` namespace import.
  - **Fix:** Added `using System.Collections.Concurrent;` to `AuthController.cs`.
- **BUG-013:** EF Core Migration crash at startup with Error 2705 Column already exists.
  - **Symptom:** Backend API crashes on startup during `MigrateAsync` with `Error Number:2705` "Column already exists".
  - **Root Cause:** A duplicated migration `20260630195243_AddStripeFieldsToUsuario.cs` attempted to add Stripe fields that were already added by `20260630163528_Add_Stripe_Fields_To_Usuario.cs`.
  - **Fix:** Emptied the `Up` and `Down` methods of the duplicate migration `20260630195243_AddStripeFieldsToUsuario.cs` so EF Core treats it as a no-op, preserving the migration chain without throwing.
- **BUG-014:** POST `/api/projects` 500 — FK violation on `EstadoId`.
  - **Symptom:** Creating a project from ProjectManagePage fails with `500 Internal Server Error` (`useProjects.ts` → `POST /api/projects`).
  - **Root Cause:** After migration `AddProyectoEstadosAndMigrateData`, `CreateProjectAsync` created `Proyecto` without assigning `EstadoId` (defaulted to `Guid.Empty`), violating `FK_ProyectosInmobiliarios_ProyectosEstados_EstadoId`. Lookup also used enum `.ToString()` (`Creado`) while DB stores uppercase codes (`CREADO`).
  - **Fix:** Assign `Estado` CREADO before save; add `ProjectStatusCodes.ToCodigoUnico()` and use it in repository/seeder/public handlers.
- **BUG-015:** Expedientes list stays on CREADO after editing a project.
  - **Symptom:** Inside Editar Proyecto the status bar can show/enable Editado, but the Expedientes list badge remains CREADO after saving changes.
  - **Root Cause:** `UpdateProjectAsync` updated fields but never promoted `EstadoId` from CREADO→EDITADO. List also lacked `Edited` badge/label mapping; PATCH `/status` rejected frontend string codes (`EDITADO`).
  - **Fix:** Auto-promote CREADO→EDITADO on update; accept CodigoUnico on PATCH; show EDITADO in AdminProjectList + statusUtils.
- **BUG-014:** Application crash ("Error en la aplicacion") after successful Stripe checkout.
  - **Symptom:** After a successful Stripe checkout, the application redirects to `/#/dashboard` but shows an ErrorBoundary screen instead of the dashboard.
  - **Root Cause:** The `CheckoutReturnPage` and `PricingPage` components were navigating to the non-existent `/dashboard` route instead of the correct `/admin/dashboard` route. This caused the router to hit the `*` wildcard route which renders the `ErrorBoundary` directly.
  - **Fix:** Updated the `navigate` calls in `CheckoutReturnPage.tsx`, `PricingPage.tsx`, and their corresponding test files to point to `/admin/dashboard`.
- **BUG-015:** Dashboard Stats and Settings endpoints fail (500 Error & Empty UI).
  - **Symptom:** `/api/admin/dashboard/stats` and `/api/admin/users` endpoints returned 500 Internal Server Errors causing empty dashboards in UI.
  - **Root Cause:** EF Core failed to translate a LINQ expression referencing `Proyecto.Status`, which is a computed unmapped property.
  - **Fix:** Modified `DashboardRepository.cs` to query using the mapped column `EstadoProyecto` instead. Restarted the API container to clear the compiled expression cache. Endpoints now successfully return 200 OK with populated dummy data.
- **BUG-016:** Unit test failures due to database seeding, model method parameter changes, and schema updates.
  - **Symptom:** xUnit tests in `UnitTests` failed compiling or running.
  - **Root Cause:**
    1. `PlanSuscripcion.Create` parameter count increased from 9 to 17 but test factories and integration helpers still used 9-parameter signatures.
    2. `RegisterUserTests` expected `"Consultor"` plan but `RegisterUserCommandHandler` requested `"Gratuito"`.
    3. `InternalValidationEngineTests` expected 20 failed documents but the required document count increased to 25.
    4. `InitiateDgriValidationCommandHandlerTests` mocked `GetByIdAsync` on `IUsuarioRepository` instead of `GetByIdWithPlanAsync` which was called by the handler, and did not set the user to `UserRole.Administrator` (causing quota check to fail).
    5. `UploadAvatarCommandHandlerTests` asserted that avatar upload returned a file path starting with `"/avatars/"` but the updated handler returned a base64 Data URI.
  - **Fix:**
    1. Updated all test factory creation calls (`TestPlanFactory.cs`, `SubscriptionTierPolicyTests.cs`, `IntegrationTestBase.cs`) to supply all 17 parameters to `PlanSuscripcion.Create`.
    2. Renamed `"Consultor"` to `"Gratuito"` setup in `RegisterUserTests.cs`.
    3. Set expected validation failed counts to 25 in `InternalValidationEngineTests.cs`.
    4. Updated `InitiateDgriValidationCommandHandlerTests.cs` to mock `GetByIdWithPlanAsync` and set user role to `UserRole.Administrator` to bypass quota checks.
    5. Corrected `UploadAvatarCommandHandlerTests.cs` to assert base64 Data URI format and removed the local file cleanup block.
- **BUG-017:** HashRouter URL wiped out by replaceState on Checkout Return.
  - **Symptom:** After a successful Stripe checkout, the application redirects to `http://localhost:3000/` instead of `/admin/dashboard`.
  - **Root Cause:** `CheckoutReturnPage` used `window.history.replaceState({}, '', window.location.pathname)` to strip `session_id`. Because `HashRouter` is used, `pathname` is `/`, which effectively dropped the `#/...` from the URL, causing React Router to reset to the landing page `/`.
  - **Fix:** Switched to safely cleaning up `session_id` from the raw URL (`newUrl.searchParams.delete()`) and the hash query parameters using `setSearchParams` without wiping the hash component itself.
- **BUG-018:** SQL Server (sqlserver-1) unhealthy state and API startup failures.
  - **Symptom:** `docker compose up -d` fails because the SQL Server container remains unhealthy and fails to start, preventing the API container and python environment container from launching successfully. When SQL Server starts, the API container crashes with a missing `Stripe:SecretKey` exception.
  - **Root Cause:**
    1. A previous security hardening commit externalized the database connection string and password using environment variables (`$DB_PASSWORD` and `$ConnectionStrings__DockerConnection`), but forgot to define them in the local `.env` file. Consequently, `MSSQL_SA_PASSWORD` was set to an empty string, which violated SQL Server's password complexity policy (minimum 8 characters) causing it to crash during setup.
    2. The migration `20260706170900_Add_Propietario_IPI_To_Proyectos.cs` was missing its `.Designer.cs` file and the `[Migration]` metadata attributes. Therefore, EF Core's assembly scanning skipped it, resulting in missing database columns (`CedulaRncPropietario`, `Ipi`, `Propietario`) during EF Core schema seeding.
    3. The API container was missing the `Stripe__SecretKey` configuration in the `.env` file, causing a validation failure on startup.
  - **Fix:**
    1. Updated the `.env` file to configure the missing `DB_PASSWORD`, `ConnectionStrings__DockerConnection`, and `Stripe__SecretKey` (using `sk_test_mock` as fallback).
    2. Added the `[DbContext(typeof(AppDbContext))]` and `[Migration("20260706170900_Add_Propietario_IPI_To_Proyectos")]` attributes to the migration class so EF Core scans and applies the schema changes properly.
- **BUG-019:** Google Login 500 Error - Invalid column name CancelAt.
  - **Symptom:** When logging in with Google OAuth, the backend returned a 500 Internal Server Error.
  - **Root Cause:** The `Usuario.cs` entity was updated with `CancelAt` and `CancelAtPeriodEnd` for the Stripe Subscription Cancellation feature, but the database schema lacked these columns, causing an EF Core `SqlException`.
  - **Fix:** Generated the missing EF Core migration (`Add_CancelAt_To_Usuario`), applied it, and restarted the container to ensure `AppDbContext` creates the columns properly during startup seeding. Verified the columns exist using sqlcmd.
- **BUG-020:** 404 Not Found on Validation Result endpoint.
  - **Symptom:** The frontend UI returns a 404 Not Found when trying to fetch the validation result (`GET /projects/{id}/validations/result`) and when triggering the validation (`POST /projects/{id}/validations/run`).
  - **Root Cause:** The frontend `useValidations.ts` was calling an endpoint path that didn't match the backend. The `ProjectValidationController` is mapped to `api/projects/{projectId}/validate` for POST, and `api/projects/{projectId}/validation-result` for GET, while the frontend attempted to call `/validations/run` and `/validations/result`.
  - **Fix:** Aligned the frontend `apiClient` requests in `useValidations.ts` to exactly match the existing backend routing paths (`/validate` and `/validation-result`).

- **COMP-001:** Verify consent test passes in CI pipeline.
     - **Status:** Complete
     - **Details:** Verified via local Docker container running .NET 8.0 SDK (Passed: 7/7) and via GitHub Actions CI pipeline (backend jobs successful on branch `verify-ci-consent`).
- **BUG-021:** SyntaxError: Unexpected token ':' in `RequirementUploadRow.tsx` at runtime.
  - **Symptom:** The browser console throws `Uncaught SyntaxError: Unexpected token ':' (at RequirementUploadRow.tsx:7:27)` preventing page execution when importing the requirement upload UI row.
  - **Root Cause:** A newly added component file `RequirementUploadRow.tsx` was created on the host filesystem after the Docker container started. Vite's file resolution cache in `node_modules/.vite` failed to resolve and transform it correctly, causing the dev server to serve the raw TSX source code to the browser instead of transpiled JavaScript.
  - **Fix:** Deleted the Vite compilation cache (`node_modules/.vite`) inside the container and restarted the `web` dev server container, forcing a clean rebuild.
- **BUG-022:** Missing dummy projects and test users (from Gratuito to Corporativo).
  - **Symptom:** The user noticed that only one manually created project was showing up in the dashboard, and the dummy users specified in the `Docker_readme.md` were not created. Additionally, the `/api/admin/users` POST endpoint threw a 500 error during user creation.
  - **Root Cause:** The `AppDbContextSeeder` was crashing halfway through its execution because it tried to add a welcome notification (`Notificacion`) for the newly seeded admin user, but the `Notificacion` table was missing the newly added `CodigoReferencia` column. This missing column exception caused the entire seeder to abort, meaning all subsequent users (Freemium, Consultor, Profesional, Empresa, Corporativo) and their dummy projects were never created.
  - **Fix:** Applied the pending EF Core migration (`20260712173705_Add_CodigoReferencia_To_Notificaciones`) to add the missing column and restarted the API container. The seeder now runs to completion and successfully creates all test users and dummy projects.
- **BUG-023:** 500 Error when creating user and emails not being sent.
  - **Symptom:** The `/api/admin/users` POST endpoint returned a 500 Internal Server Error when creating users, and no emails (for user creation or validation) were being sent.
  - **Root Cause:** A missing EF Core migration or mapping caused `UsuarioLegacy.NombreCompleto` to be unmapped on inserts, throwing an SQL exception during `SaveChangesAsync()`. Because this failed and aborted the transaction, the subsequent code that successfully dispatches emails via `Resend` was never reached.
  - **Fix:** Used `sqlcmd` to manually add `NombreCompleto` as a `PERSISTED` computed column to `UsuarioLegacy` on the SQL Server. The user creation now succeeds and the email sending block is triggered correctly via Resend API.
- **BUG-024:** Dashboard UI issue in user workflow tab.
  - **Symptom:** On the dashboard's "Flujo de Usuarios" tab, the "Ver Lista de Usuarios" button did not visually substitute the "Ver listado" and "Nuevo Proyecto" buttons in a centered manner.
  - **Root Cause:** The `DashboardPageLayout.tsx` used `justify-between` and the secondary button was right-aligned without proper container constraints to span the space where the two project buttons used to be.
  - **Fix:** Wrapped the "Ver Lista de Usuarios" button in a `w-full` flex container and changed its style to primary so it is now visually centered in the 300px space where the project buttons were located.
- **TASK-1787:** Modificación de tabla `CatastroTitulo` y seeder.
  - **Symptom:** Eliminar `IdProyecto` de `CatastroTitulo` y actualizar el script `generador_entidades_gubernamentales.py` para generar 1.6 millones de registros de títulos con los datos de designación catastral.
  - **Status:** Complete (Background script finished in 926.42 seconds generating 1.6M rows).
  - **Fix:** Script Python actualizado y ejecutado con éxito. Eliminado IdProyecto y añadido CodigoDesignacionCatastral con coordenadas GPS únicas.

### Debug Session: Migration Error
- **Symptom**: Migration failure on startup: `ALTER TABLE DROP COLUMN failed because column 'NombreCompleto' does not exist in table 'UsuarioLegacy'.` 
- **Root Cause**: Migration `20260713164614_AddEstatusIpiToProjects.cs` attempted to drop `NombreCompleto` from `UsuarioLegacy`, but the column didn't exist.
- **Fix**: Removed `DropColumn` and `AddColumn` for `NombreCompleto` inside the migration.

- **BUG-025:** EF Core Migration Crash at startup with Error 2705 Column 'PasswordResetToken' already exists.
  - **Symptom:** Backend API crashes on startup during MigrateAsync with `Error Number:2705` "Column names in each table must be unique. Column name 'PasswordResetToken' in table 'Usuario' is specified more than once."
  - **Root Cause:** The `20260713164614_AddEstatusIpiToProjects.cs` migration erroneously included `AddColumn` for `PasswordResetToken` and `PasswordResetTokenExpiraUtc`, which were already added by a previous migration (`20260713115949_AddPasswordResetToken.cs`).
  - **Fix:** Used TDD/Surgical fix to remove the duplicate `AddColumn` and `DropColumn` from the `Up` and `Down` methods of `20260713164614_AddEstatusIpiToProjects.cs` and rebuilt the API Docker container so the changes took effect on the compiled DLLs. The API now starts successfully.
- **BUG-026:** 500 Error when creating projects (Invalid column name 'EstatusDescripcion').
  - **Symptom:** `POST /api/projects` returns 500 Internal Server Error.
  - **Root Cause:** EF Core attempted to insert `EstatusDescripcion` into the database because it was mapped in `ProyectoConfiguration.cs`, but the database column did not exist and its migration file was empty.
  - **Fix:** Changed `EstatusDescripcion` in `Proyecto.cs` to be a computed property `=> GetEstatusDescripcion(EstadoProyecto)` instead of a persisted column. Removed the mapping from `ProyectoConfiguration.cs` and `AppDbContextModelSnapshot.cs`. Deleted the empty migration files and rebuilt the API container.
- **BUG-027:** Project images return 404 in project lists despite static file mapping.
  - **Symptom:** Images uploaded as project cover return 404 Not Found.
  - **Root Cause:** `AzureBlobStorageService.cs` erroneously used `fileName.Replace("/", "\\")`. On the Linux-based Docker container, `\` is treated as part of the filename instead of a directory separator, resulting in a single flat file being created and causing the `UseStaticFiles` middleware to fail resolution. Additionally, `/app/wwwroot/uploads` was not mapped to a persistent volume, causing all images to be wiped out on container restarts.
  - **Fix:** Fixed path substitution to use `Path.DirectorySeparatorChar`. Updated `docker-compose.yml` to map `api_uploads:/app/wwwroot/uploads` so future images persist across container rebuilds.
- **BUG-028:** `usePublicReport` returns 404 on unvalidated projects but fails silently or triggers React Query error states.
  - **Symptom:** `useReports.ts:46 GET http://localhost:5000/api/projects/ID/reports/public 404 (Not Found)`
  - **Root Cause:** The `GetPublicProjectReportQueryHandler` returns `null` when no report is found, leading to a 404 status. React Query automatically retried this 404 three times, flooding the console and network.
  - **Fix:** Configured React Query `retry` function in `usePublicReport` to return `false` on a 404 response, allowing the UI to gracefully handle the "no report" state. Also added UI modal to show registrant information on "CONTACTAR DESARROLLADOR" button click.
- **BUG-029:** Unit tests in `DocumentServiceTests` fail with `QuotaExceededException`.
  - **Symptom:** Tests executing document uploads mock `PlanSuscripcion` but the `GetEffectivePlan` logic treats empty prices or unmapped states as invalid for storage quota.
  - **Root Cause:** A test factory used `new PlanSuscripcion(...)` with a private/missing constructor and lacked the proper setup to trigger the `SubscriptionTierPolicy.CanStoreDocument` bypass (which allows Free plans with 0 price).
  - **Fix:** Switched to using `PlanSuscripcion.Create(...)` factory method and mapped the mocked plan to 0m price and unlimited storage for testing purposes.
- **TASK-1788:** PaddleOCR Integration and E2E Tests.
  - **Symptom:** PaddleOCR microservice was crashing inside Docker due to missing \libgomp1\ library. E2E tests related to destructive actions were failing because of layout locators and accessibility regressions with TEXTAREA components.
  - **Status:** Complete.
## 🚫 Known Constraints
- None

---

## 📋 QA Backlog (from To-do.txt)
| Priority         | Count | Items                                         |
| ---------------- | ----- | --------------------------------------------- |
| 🔴 P0 — Critical  | 6     | WBS-001..006 — Routes rotas + E2E tests       |
| 🟠 P1 — High      | 8     | WBS-007..014 — Security, Compliance, 17 UIs   |
| 🟡 P2 — Medium    | 5     | WBS-015..019 — UX mejoras                     |
| 🟢 P3 — Tech Debt | 10    | TEC-001..010 — Accesibilidad, rendimiento, CI |

## 🔄 In Progress (QA Roadmap — ORCH-TEST-001 Proof)
| WBS     | Item                            | Agent                | Status                  |
| ------- | ------------------------------- | -------------------- | ----------------------- |
| WBS-001 | RegisterPage test               | tdd-guide            | ✅ 257 lines, 11 tests   |
| WBS-005 | TC-002 coordinates diagnosis    | build-error-resolver | ✅ Diagnosis report      |
| WBS-007 | JWT localStorage audit          | security-reviewer    | ✅ SEC-001 surfaced      |
| WBS-009 | Bundle optimization             | refactor-cleaner     | ✅ Analysis report       |
| WBS-012 | Password policy xUnit test      | tdd-guide            | ✅ 6 theory/2 fact tests |
| WBS-013 | Consent gate audit (Law 172-13) | ley172-13-auditor    | ✅ COMP-001 surfaced     |
| WBS-014 | 17 UI screens breakdown         | planner              | ✅ 17 screens mapped     |
| WBS-020 | RF-10 Integrity Seal ADR        | architect            | ✅ ADR-005 (357 lines)   |
| TEC-010 | SonarCloud pipeline gate        | devops-specialist    | ✅ Pipeline config       |
| WBS-022 | Invitation Limits E2E Tests     | playwright-skill     | ✅ 08-invitation-limits  |

## ⚠️ Open Decisions (Human-in-the-Loop Required)
- [x] JWT migration from localStorage to HttpOnly cookies (SEC-001) — surfaced in ORCH-TEST-001 (DONE - Security Hardening)
- [x] TransUnion consent gate verification (COMP-001) — surfaced in ORCH-TEST-001 (DONE)
- [ ] Set GROQ_API_KEY environment variable — all 8 subagents return empty without it (ROOT CAUSE)
- [x] Create missing agent files: BatchExecutor.md, DocWriter.md (DONE)
- [x] ADR-006: SEC-001 JWT cookie migration plan (PHASED, APPROVAL REQUIRED)
- [x] ADR-007: COMP-001 TransUnion consent gate plan (IMPLEMENTED — version check + tests)
  - `ConsentGateConstants.CurrentVersionPolitica = "v1.0"` (Application.Common)
  - `ConsultarCreditoCommandHandler` blocks TransUnion if version mismatch
  - `VerificarConsentimientoVigenteQueryHandler` returns false if version mismatch
  - Test: `CreditCheck_ConsentVersionMismatch_BlocksTransUnion`
- [ ] Public endpoint changes for Precios page (BUG-005)

## 🔄 Expanded Scope (Post-Audit — 2026-06-29)
| New ID  | Item                                     | Priority | RF    | OE      |
| ------- | ---------------------------------------- | -------- | ----- | ------- |
| WBS-020 | Sello Digital endpoint + QR (Law 126-02) | P1       | RF-10 | OE-7    |
| WBS-021 | Documentary Diagnosis UI + Rules Engine  | P1       | RF-2  | OE-1    |
| TEC-011 | DataRetentionPurgeJob (30d/90d/7yr)      | P3       | RNF-5 | OE-6    |
| TEC-012 | Availability monitoring + health checks  | P3       | RNF-3 | General |
| TEC-013 | Load testing target with k6              | P3       | RNF-4 | General |

**Audit findings resolved:** RF-2 gap, RF-10 gap, RNF-3/4/5 gaps, PERF-001 reclassified P1, OE traceability corrected, "47 requisitos" source clarified.

> Updated: 2026-06-29T20:30:00-04:00 by DocWriter v1.0 (Post-Audit Patch — +5 items, 34 total)

## 🐛 Resolved Bugs
- **BUG-031:** 404 Not Found on `PATCH /api/projects/{projectId}/documents/{documentId}/type`.
  - **Symptom:** Selecting a document in the dropdown or clicking delete triggers a PATCH request that returns `404 Not Found`.
  - **Root Cause:** A previous agent added the `[HttpPatch("{documentId}/type")]` route to `ProjectDocumentsController.cs`, but the backend Docker container `api` was not rebuilt to compile and host the new route.
  - **Fix:** Fixed by executing `docker compose build api` and `docker compose up -d api` to rebuild the backend API container, after which the endpoint became available and returned 401/200 properly.
- **BUG-030:** 500 Error on Document Upload and missing validation states in UI.
  - **Symptom:** Document uploads return 500 errors and the UI does not show explicit document processing states (Procesando/Verificado/Rechazado) or the uploaded file name.
  - **Root Cause:** Backend error on upload and missing properties in UI components meant that state and filename were not passed down to the `RequirementUploadRow`.
  - **Fix:** Fixed upload 500 error, updated `RequirementUploadRow` to accept `fileName` and `documentStatus`, added `ShieldCheck` UI icon for Verificado, and added Playwright/Vitest tests to cover the transitions.
- **BUG-007:** 404 Not Found on `/api/auth/resend-verification`.
  - **Symptom:** The new frontend `useResendVerificationEmail` mutation failed with `404 Not Found` despite the backend having the endpoint correctly implemented.
  - **Root Cause:** `dotnet watch` inside the Docker container failed to hot-reload and compile the newly added `ResendVerificationEmail` namespace. The `Api` container was still running the older version without the endpoint mapped.
  - **Fix:** Fixed by manually executing `dotnet build` inside the container or forcing a restart of the container to pick up the new files properly, which successfully compiled the `Api` layer.
- **BUG-006:** HashRouter + Stripe `return_url` incompatibility. 
  - **Symptom:** `session_id` persists in URL after hard reset on checkout return page.
  - **Root Cause:** Stripe redirects to a regular URL which HashRouter misinterprets, preventing `CheckoutReturnPage` from routing and maintaining `session_id` in the real search params.
  - **Fix:** Fixed backend `return_url` to include `/#/`, added `window.location.search` fallback and `sessionStorage` idempotency guard in `CheckoutReturnPage.tsx`.
  - **Commit:** 507891d3
- **BUG-007:** User session leakage/crossover on login.
  - **Symptom:** When logging in, the user sees data from a previous session or another user.
  - **Root Cause:** React Query cache (`queryClient`) was not being cleared on login or logout, leading to old data persisting in the client.
  - **Fix:** Used TDD to add `queryClient.clear()` in `AuthContext.tsx` on `login`, `logout`, and `auth:force-logout` events.
- **BUG-008:** Local API process binding intercepting Docker traffic.
  - **Symptom:** Login returns 500 Internal Server Error, and create-session returns 400.
  - **Root Cause:** A local dotnet run instance (task-1227) was binding to port 5000 on the host, intercepting traffic meant for the Docker container. It used the Production environment and attempted Windows Authentication against SQLEXPRESS, failing silently due to log level settings.
  - **Fix:** Killed the rogue local process, restoring traffic to the Docker container.
- **BUG-009:** Stripe API ArgumentException masked as 400 Bad Request.
  - **Symptom:** Missing Stripe Secret Key causes the `/v1/subscriptions/session-status` endpoint to return `400 Bad Request` instead of `500 Internal Server Error`, misleading the frontend error handling.
  - **Root Cause:** `StripeConfiguration.ApiKey` was null/empty. When `SessionService.GetAsync()` was called, the Stripe SDK threw an `ArgumentException` directly (bypassing `catch (StripeException e)`). `GlobalExceptionHandler` caught the `ArgumentException` and incorrectly transformed it to `400 Bad Request`.
  - **Fix:** Added an explicit missing configuration check inside `GetSessionStatus` to return `500 Internal Server Error` before any Stripe API code is invoked. TDD test added.
- **BUG-010:** E2E Tests failing due to stuck loading states and missing package.json scripts.
  - **Symptom:** `pnpm run test:e2e` fails or hangs, and the `test:e2e` script was missing. `diagnosis-ui.spec.ts` and `project-photos.spec.ts` fail due to timeout waiting for UI elements.
  - **Root Cause:** The `package.json` was missing the `test:e2e` script. The E2E tests for `diagnosis-ui` and `project-photos` did not mock the `**/api/auth/refresh` and `**/api/notifications*` routes, causing the app to hang in a loading state or fail to load data, leading to Playwright timeouts.
  - **Fix:** Added `"test:e2e": "playwright test"` to `package.json`. Added the missing API mocks to the `beforeEach` hooks of both failing test files. Tests now pass.
- **BUG-011:** Duplicate Stripe integration fields causing CS0102 compilation error.
  - **Symptom:** `dotnet watch` fails with `CS0102: The type 'Usuario' already contains a definition for 'StripeCustomerId'` (and others).
  - **Root Cause:** A bad merge duplicated the `StripeCustomerId`, `StripeSubscriptionId`, `SubscriptionStatus`, and `CurrentPeriodEnd` fields in `Usuario.cs`.
  - **Fix:** Removed the duplicated fields from `Usuario.cs`.
- **BUG-012:** Missing ConcurrentDictionary namespace causing CS0246 compilation error.
  - **Symptom:** `dotnet watch` fails with `CS0246: The type or namespace name 'ConcurrentDictionary<,>' could not be found` in `AuthController.cs`.
  - **Root Cause:** Missing `using System.Collections.Concurrent;` namespace import.
  - **Fix:** Added `using System.Collections.Concurrent;` to `AuthController.cs`.
- **BUG-013:** EF Core Migration crash at startup with Error 2705 Column already exists.
  - **Symptom:** Backend API crashes on startup during `MigrateAsync` with `Error Number:2705` "Column already exists".
  - **Root Cause:** A duplicated migration `20260630195243_AddStripeFieldsToUsuario.cs` attempted to add Stripe fields that were already added by `20260630163528_Add_Stripe_Fields_To_Usuario.cs`.
  - **Fix:** Emptied the `Up` and `Down` methods of the duplicate migration `20260630195243_AddStripeFieldsToUsuario.cs` so EF Core treats it as a no-op, preserving the migration chain without throwing.
- **BUG-014:** POST `/api/projects` 500 — FK violation on `EstadoId`.
  - **Symptom:** Creating a project from ProjectManagePage fails with `500 Internal Server Error` (`useProjects.ts` → `POST /api/projects`).
  - **Root Cause:** After migration `AddProyectoEstadosAndMigrateData`, `CreateProjectAsync` created `Proyecto` without assigning `EstadoId` (defaulted to `Guid.Empty`), violating `FK_ProyectosInmobiliarios_ProyectosEstados_EstadoId`. Lookup also used enum `.ToString()` (`Creado`) while DB stores uppercase codes (`CREADO`).
  - **Fix:** Assign `Estado` CREADO before save; add `ProjectStatusCodes.ToCodigoUnico()` and use it in repository/seeder/public handlers.
- **BUG-015:** Expedientes list stays on CREADO after editing a project.
  - **Symptom:** Inside Editar Proyecto the status bar can show/enable Editado, but the Expedientes list badge remains CREADO after saving changes.
  - **Root Cause:** `UpdateProjectAsync` updated fields but never promoted `EstadoId` from CREADO→EDITADO. List also lacked `Edited` badge/label mapping; PATCH `/status` rejected frontend string codes (`EDITADO`).
  - **Fix:** Auto-promote CREADO→EDITADO on update; accept CodigoUnico on PATCH; show EDITADO in AdminProjectList + statusUtils.
- **BUG-014:** Application crash ("Error en la aplicacion") after successful Stripe checkout.
  - **Symptom:** After a successful Stripe checkout, the application redirects to `/#/dashboard` but shows an ErrorBoundary screen instead of the dashboard.
  - **Root Cause:** The `CheckoutReturnPage` and `PricingPage` components were navigating to the non-existent `/dashboard` route instead of the correct `/admin/dashboard` route. This caused the router to hit the `*` wildcard route which renders the `ErrorBoundary` directly.
  - **Fix:** Updated the `navigate` calls in `CheckoutReturnPage.tsx`, `PricingPage.tsx`, and their corresponding test files to point to `/admin/dashboard`.
- **BUG-015:** Dashboard Stats and Settings endpoints fail (500 Error & Empty UI).
  - **Symptom:** `/api/admin/dashboard/stats` and `/api/admin/users` endpoints returned 500 Internal Server Errors causing empty dashboards in UI.
  - **Root Cause:** EF Core failed to translate a LINQ expression referencing `Proyecto.Status`, which is a computed unmapped property.
  - **Fix:** Modified `DashboardRepository.cs` to query using the mapped column `EstadoProyecto` instead. Restarted the API container to clear the compiled expression cache. Endpoints now successfully return 200 OK with populated dummy data.
- **BUG-016:** Unit test failures due to database seeding, model method parameter changes, and schema updates.
  - **Symptom:** xUnit tests in `UnitTests` failed compiling or running.
  - **Root Cause:**
    1. `PlanSuscripcion.Create` parameter count increased from 9 to 17 but test factories and integration helpers still used 9-parameter signatures.
    2. `RegisterUserTests` expected `"Consultor"` plan but `RegisterUserCommandHandler` requested `"Gratuito"`.
    3. `InternalValidationEngineTests` expected 20 failed documents but the required document count increased to 25.
    4. `InitiateDgriValidationCommandHandlerTests` mocked `GetByIdAsync` on `IUsuarioRepository` instead of `GetByIdWithPlanAsync` which was called by the handler, and did not set the user to `UserRole.Administrator` (causing quota check to fail).
    5. `UploadAvatarCommandHandlerTests` asserted that avatar upload returned a file path starting with `"/avatars/"` but the updated handler returned a base64 Data URI.
  - **Fix:**
    1. Updated all test factory creation calls (`TestPlanFactory.cs`, `SubscriptionTierPolicyTests.cs`, `IntegrationTestBase.cs`) to supply all 17 parameters to `PlanSuscripcion.Create`.
    2. Renamed `"Consultor"` to `"Gratuito"` setup in `RegisterUserTests.cs`.
    3. Set expected validation failed counts to 25 in `InternalValidationEngineTests.cs`.
    4. Updated `InitiateDgriValidationCommandHandlerTests.cs` to mock `GetByIdWithPlanAsync` and set user role to `UserRole.Administrator` to bypass quota checks.
    5. Corrected `UploadAvatarCommandHandlerTests.cs` to assert base64 Data URI format and removed the local file cleanup block.
- **BUG-017:** HashRouter URL wiped out by replaceState on Checkout Return.
  - **Symptom:** After a successful Stripe checkout, the application redirects to `http://localhost:3000/` instead of `/admin/dashboard`.
  - **Root Cause:** `CheckoutReturnPage` used `window.history.replaceState({}, '', window.location.pathname)` to strip `session_id`. Because `HashRouter` is used, `pathname` is `/`, which effectively dropped the `#/...` from the URL, causing React Router to reset to the landing page `/`.
  - **Fix:** Switched to safely cleaning up `session_id` from the raw URL (`newUrl.searchParams.delete()`) and the hash query parameters using `setSearchParams` without wiping the hash component itself.
- **BUG-018:** SQL Server (sqlserver-1) unhealthy state and API startup failures.
  - **Symptom:** `docker compose up -d` fails because the SQL Server container remains unhealthy and fails to start, preventing the API container and python environment container from launching successfully. When SQL Server starts, the API container crashes with a missing `Stripe:SecretKey` exception.
  - **Root Cause:**
    1. A previous security hardening commit externalized the database connection string and password using environment variables (`$DB_PASSWORD` and `$ConnectionStrings__DockerConnection`), but forgot to define them in the local `.env` file. Consequently, `MSSQL_SA_PASSWORD` was set to an empty string, which violated SQL Server's password complexity policy (minimum 8 characters) causing it to crash during setup.
    2. The migration `20260706170900_Add_Propietario_IPI_To_Proyectos.cs` was missing its `.Designer.cs` file and the `[Migration]` metadata attributes. Therefore, EF Core's assembly scanning skipped it, resulting in missing database columns (`CedulaRncPropietario`, `Ipi`, `Propietario`) during EF Core schema seeding.
    3. The API container was missing the `Stripe__SecretKey` configuration in the `.env` file, causing a validation failure on startup.
  - **Fix:**
    1. Updated the `.env` file to configure the missing `DB_PASSWORD`, `ConnectionStrings__DockerConnection`, and `Stripe__SecretKey` (using `sk_test_mock` as fallback).
    2. Added the `[DbContext(typeof(AppDbContext))]` and `[Migration("20260706170900_Add_Propietario_IPI_To_Proyectos")]` attributes to the migration class so EF Core scans and applies the schema changes properly.
- **BUG-019:** Google Login 500 Error - Invalid column name CancelAt.
  - **Symptom:** When logging in with Google OAuth, the backend returned a 500 Internal Server Error.
  - **Root Cause:** The `Usuario.cs` entity was updated with `CancelAt` and `CancelAtPeriodEnd` for the Stripe Subscription Cancellation feature, but the database schema lacked these columns, causing an EF Core `SqlException`.
  - **Fix:** Generated the missing EF Core migration (`Add_CancelAt_To_Usuario`), applied it, and restarted the container to ensure `AppDbContext` creates the columns properly during startup seeding. Verified the columns exist using sqlcmd.
- **BUG-020:** 404 Not Found on Validation Result endpoint.
  - **Symptom:** The frontend UI returns a 404 Not Found when trying to fetch the validation result (`GET /projects/{id}/validations/result`) and when triggering the validation (`POST /projects/{id}/validations/run`).
  - **Root Cause:** The frontend `useValidations.ts` was calling an endpoint path that didn't match the backend. The `ProjectValidationController` is mapped to `api/projects/{projectId}/validate` for POST, and `api/projects/{projectId}/validation-result` for GET, while the frontend attempted to call `/validations/run` and `/validations/result`.
  - **Fix:** Aligned the frontend `apiClient` requests in `useValidations.ts` to exactly match the existing backend routing paths (`/validate` and `/validation-result`).

- **COMP-001:** Verify consent test passes in CI pipeline.
     - **Status:** Complete
     - **Details:** Verified via local Docker container running .NET 8.0 SDK (Passed: 7/7) and via GitHub Actions CI pipeline (backend jobs successful on branch `verify-ci-consent`).
- **BUG-021:** SyntaxError: Unexpected token ':' in `RequirementUploadRow.tsx` at runtime.
  - **Symptom:** The browser console throws `Uncaught SyntaxError: Unexpected token ':' (at RequirementUploadRow.tsx:7:27)` preventing page execution when importing the requirement upload UI row.
  - **Root Cause:** A newly added component file `RequirementUploadRow.tsx` was created on the host filesystem after the Docker container started. Vite's file resolution cache in `node_modules/.vite` failed to resolve and transform it correctly, causing the dev server to serve the raw TSX source code to the browser instead of transpiled JavaScript.
  - **Fix:** Deleted the Vite compilation cache (`node_modules/.vite`) inside the container and restarted the `web` dev server container, forcing a clean rebuild.
- **BUG-022:** Missing dummy projects and test users (from Gratuito to Corporativo).
  - **Symptom:** The user noticed that only one manually created project was showing up in the dashboard, and the dummy users specified in the `Docker_readme.md` were not created. Additionally, the `/api/admin/users` POST endpoint threw a 500 error during user creation.
  - **Root Cause:** The `AppDbContextSeeder` was crashing halfway through its execution because it tried to add a welcome notification (`Notificacion`) for the newly seeded admin user, but the `Notificacion` table was missing the newly added `CodigoReferencia` column. This missing column exception caused the entire seeder to abort, meaning all subsequent users (Freemium, Consultor, Profesional, Empresa, Corporativo) and their dummy projects were never created.
  - **Fix:** Applied the pending EF Core migration (`20260712173705_Add_CodigoReferencia_To_Notificaciones`) to add the missing column and restarted the API container. The seeder now runs to completion and successfully creates all test users and dummy projects.
- **BUG-023:** 500 Error when creating user and emails not being sent.
  - **Symptom:** The `/api/admin/users` POST endpoint returned a 500 Internal Server Error when creating users, and no emails (for user creation or validation) were being sent.
  - **Root Cause:** A missing EF Core migration or mapping caused `UsuarioLegacy.NombreCompleto` to be unmapped on inserts, throwing an SQL exception during `SaveChangesAsync()`. Because this failed and aborted the transaction, the subsequent code that successfully dispatches emails via `Resend` was never reached.
  - **Fix:** Used `sqlcmd` to manually add `NombreCompleto` as a `PERSISTED` computed column to `UsuarioLegacy` on the SQL Server. The user creation now succeeds and the email sending block is triggered correctly via Resend API.
- **BUG-024:** Dashboard UI issue in user workflow tab.
  - **Symptom:** On the dashboard's "Flujo de Usuarios" tab, the "Ver Lista de Usuarios" button did not visually substitute the "Ver listado" and "Nuevo Proyecto" buttons in a centered manner.
  - **Root Cause:** The `DashboardPageLayout.tsx` used `justify-between` and the secondary button was right-aligned without proper container constraints to span the space where the two project buttons used to be.
  - **Fix:** Wrapped the "Ver Lista de Usuarios" button in a `w-full` flex container and changed its style to primary so it is now visually centered in the 300px space where the project buttons were located.
- **TASK-1787:** Modificación de tabla `CatastroTitulo` y seeder.
  - **Symptom:** Eliminar `IdProyecto` de `CatastroTitulo` y actualizar el script `generador_entidades_gubernamentales.py` para generar 1.6 millones de registros de títulos con los datos de designación catastral.
  - **Status:** Complete (Background script finished in 926.42 seconds generating 1.6M rows).
  - **Fix:** Script Python actualizado y ejecutado con éxito. Eliminado IdProyecto y añadido CodigoDesignacionCatastral con coordenadas GPS únicas.

### Debug Session: Migration Error
- **Symptom**: Migration failure on startup: `ALTER TABLE DROP COLUMN failed because column 'NombreCompleto' does not exist in table 'UsuarioLegacy'.` 
- **Root Cause**: Migration `20260713164614_AddEstatusIpiToProjects.cs` attempted to drop `NombreCompleto` from `UsuarioLegacy`, but the column didn't exist.
- **Fix**: Removed `DropColumn` and `AddColumn` for `NombreCompleto` inside the migration.

- **BUG-025:** EF Core Migration Crash at startup with Error 2705 Column 'PasswordResetToken' already exists.
  - **Symptom:** Backend API crashes on startup during MigrateAsync with `Error Number:2705` "Column names in each table must be unique. Column name 'PasswordResetToken' in table 'Usuario' is specified more than once."
  - **Root Cause:** The `20260713164614_AddEstatusIpiToProjects.cs` migration erroneously included `AddColumn` for `PasswordResetToken` and `PasswordResetTokenExpiraUtc`, which were already added by a previous migration (`20260713115949_AddPasswordResetToken.cs`).
  - **Fix:** Used TDD/Surgical fix to remove the duplicate `AddColumn` and `DropColumn` from the `Up` and `Down` methods of `20260713164614_AddEstatusIpiToProjects.cs` and rebuilt the API Docker container so the changes took effect on the compiled DLLs. The API now starts successfully.
- **BUG-026:** 500 Error when creating projects (Invalid column name 'EstatusDescripcion').
  - **Symptom:** `POST /api/projects` returns 500 Internal Server Error.
  - **Root Cause:** EF Core attempted to insert `EstatusDescripcion` into the database because it was mapped in `ProyectoConfiguration.cs`, but the database column did not exist and its migration file was empty.
  - **Fix:** Changed `EstatusDescripcion` in `Proyecto.cs` to be a computed property `=> GetEstatusDescripcion(EstadoProyecto)` instead of a persisted column. Removed the mapping from `ProyectoConfiguration.cs` and `AppDbContextModelSnapshot.cs`. Deleted the empty migration files and rebuilt the API container.
- **BUG-027:** Project images return 404 in project lists despite static file mapping.
  - **Symptom:** Images uploaded as project cover return 404 Not Found.
  - **Root Cause:** `AzureBlobStorageService.cs` erroneously used `fileName.Replace("/", "\\")`. On the Linux-based Docker container, `\` is treated as part of the filename instead of a directory separator, resulting in a single flat file being created and causing the `UseStaticFiles` middleware to fail resolution. Additionally, `/app/wwwroot/uploads` was not mapped to a persistent volume, causing all images to be wiped out on container restarts.
  - **Fix:** Fixed path substitution to use `Path.DirectorySeparatorChar`. Updated `docker-compose.yml` to map `api_uploads:/app/wwwroot/uploads` so future images persist across container rebuilds.
- **BUG-028:** `usePublicReport` returns 404 on unvalidated projects but fails silently or triggers React Query error states.
  - **Symptom:** `useReports.ts:46 GET http://localhost:5000/api/projects/ID/reports/public 404 (Not Found)`
  - **Root Cause:** The `GetPublicProjectReportQueryHandler` returns `null` when no report is found, leading to a 404 status. React Query automatically retried this 404 three times, flooding the console and network.
  - **Fix:** Configured React Query `retry` function in `usePublicReport` to return `false` on a 404 response, allowing the UI to gracefully handle the "no report" state. Also added UI modal to show registrant information on "CONTACTAR DESARROLLADOR" button click.
- **BUG-029:** Unit tests in `DocumentServiceTests` fail with `QuotaExceededException`.
  - **Symptom:** Tests executing document uploads mock `PlanSuscripcion` but the `GetEffectivePlan` logic treats empty prices or unmapped states as invalid for storage quota.
  - **Root Cause:** A test factory used `new PlanSuscripcion(...)` with a private/missing constructor and lacked the proper setup to trigger the `SubscriptionTierPolicy.CanStoreDocument` bypass (which allows Free plans with 0 price).
  - **Fix:** Switched to using `PlanSuscripcion.Create(...)` factory method and mapped the mocked plan to 0m price and unlimited storage for testing purposes.
- **TASK-1788:** PaddleOCR Integration and E2E Tests.
  - **Symptom:** PaddleOCR microservice was crashing inside Docker due to missing \libgomp1\ library. E2E tests related to destructive actions were failing because of layout locators and accessibility regressions with TEXTAREA components.
  - **Status:** Complete.
  - **Fix:** Added \libgomp1\ to \paddleocr-api/Dockerfile\. Wrapped \SettingsPage.tsx\ destructive actions in a semantic \<section>\. Updated \DeleteAccountModal.tsx\ to allow \TEXTAREA\ in focus traps. Verified 82/82 Playwright tests pass successfully.
- **BUG-030:** "Zona de Peligro" was in the "Mi Perfil" tab instead of "Seguridad".
  - **Symptom:** User observed the account deletion section appearing in the "Mi Perfil" settings tab, leaving the "Seguridad" tab completely empty.
  - **Root Cause:** In SettingsPage.tsx, the <DeleteAccountSection /> and its surrounding <section> were placed inside the activeTab === "profile" conditional block instead of activeTab === "security".
  - **Fix:** Moved the "Zona de Peligro" section into the activeTab === "security" block. Updated the E2E test settings-destructive-action.spec.ts to navigate to the "Seguridad" tab before interacting with the danger zone, and confirmed 8/8 tests pass.
- **BUG-031:** Explicit `multipart/form-data` headers break Axios file uploads / 415 Unsupported Media Type.
  - **Symptom:** `Error uploading gallery image Copy of EVANGELISMOS D2025.png` initially, followed by `415 Unsupported Media Type`.
  - **Root Cause:** In `useDocuments.ts`, `useDocumentMutations.ts` and `useSettings.ts`, an explicit `Content-Type: multipart/form-data` header was passed to Axios, breaking boundary generation. After removing it, Axios defaulted to the global `application/json` header defined in `client.ts`, which the backend rejected with `415 Unsupported Media Type` because the controller expects `multipart/form-data`.
  - **Fix:** Removed the explicit `headers` overrides in API hooks, and modified the request interceptor in `client.ts` to `delete config.headers['Content-Type']` whenever `config.data instanceof FormData`. This allows the browser to correctly set the `multipart/form-data; boundary=...` header natively.
-   [ x ]   U p d a t e d   G e s t i � n   d e   A c t i v o   a u t h o r i z a t i o n   l o g i c   a n d   M e   i n t e r e s a   b u t t o n   b e h a v i o r  
 
- **BUG-032:** Cannot edit existing gallery photos in ProjectForm.
  - **Symptom:** The user was unable to remove or replace the gallery photos that were already attached to the project. Furthermore, uploading new photos caused existing photos to duplicate in the UI preview.
  - **Root Cause:** The existingFotoUrls state (static from initialData) and the galleryPreviews state (new uploads) were being mapped independently and combined improperly, leading to duplicate renders and lack of an 'X' button for existing ones.
  - **Fix:** Consolidated the image list into a single derived galleryUrls based on imagenAdicional1..5 states in useProjectForm.ts. Updated ProjectFormDocumentSection.tsx to apply modern ui-ux-pro-max styling and allow removing any image in the grid.
# # #   4 .   I m p l e m e n t   O C R   R e v i e w   W o r k f l o w   ( C O M P L E T E D )  
 -   * * S t a t u s * * :   '  * * C O M P L E T E D * *   ( T D D   +   P l a y w r i g h t   t e s t s   p a s s e d )  
 -   * * G o a l * * :   E n a b l e   h u m a n   r e v i e w   o f   O C R - e x t r a c t e d   f i e l d s   i n   D o c u m e n t S t a t u s . E n R e v i s i o n .  
 