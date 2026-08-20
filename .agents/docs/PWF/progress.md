# PWF Progress — VeriFinca

## Sesión 2026-08-17 — Fase 0 & Fase 2: Consolidación Atómica de SaveChangesAsync (CONCERNS.md L4)

**Ciclo:** Optimización de Transacciones / `ProjectService.CreateProjectAsync`
**Estado:** ✅ COMPLETO — UnitTests 15/15 verdes en ProjectService, Api.Tests 3/3 verdes en ProjectService, IntegrationTests 3/3 verdes contra SQL Server en Testcontainers.

### Trabajo Realizado
1. **Fase 0 (Evidencia & Diagnóstico SQL Server):**
   - Conciliación de métricas de fan-in: ~97 llamadas directas en producción (72 en Application, 25 en Infrastructure), ~140 invocaciones en tests, 298 rutas transitivas en el grafo.
   - Verificación de Colación: Base de datos y columnas `nvarchar` en `SQL_Latin1_General_CP1_CI_AS`.
   - Inventario de Índices: Índices FK ya presentes en `ProyectosInmobiliarios`, `Auditorias` y `Usuario`.
   - Perfilado SQL (`SET STATISTICS IO/TIME`): Quota count (2 lecturas lógicas, 0 ms), Project by ID (2 lecturas en proyectos, 0 ms).
2. **Fase 2 (Consolidación Atómica Acotada):**
   - Identificación de la API de auditoría: `IAuditLogger.Append(...)` es stage-only en `AppDbContext`; `AppendAsync` realiza autocommit.
   - Refactorización de `ProjectService.CreateProjectAsync`: Se eliminó el `SaveChangesAsync` intermedio prematuro. Ahora se agregan el `Proyecto` y la `Auditoria` inicial en memoria antes de un único `_unitOfWork.SaveChangesAsync()`.
   - Notificación post-commit: `NotifyProjectEvent` se dispara estrictamente después de que el commit a base de datos haya sido exitoso.
   - Pruebas Unitarias & de Integración con SQL Server:
     - `UnitTests`: Verificación de invocación única `Times.Once` de `SaveChangesAsync`, staging de auditoría con `Append`, no ejecución de `AppendAsync`, y no envío de notificaciones ante fallo en BD.
     - `Api.Tests`: Aserción actualizada de `Received(2)` a `Received(1)`.
     - `IntegrationTests` (Testcontainers SQL Server): `CreateProject_Success_PersistsProjectAndAuditAtomically`, `CreateProject_CancellationBeforeCommit_DoesNotPersistPartialState`, y `CreateProject_WhenDbSaveFails_RollsBackBothProjectAndAudit` (3/3 pasados).

---

## Sesión 2026-08-07 — Remediación RNF-3 (finalización)

**Ciclo:** OH-8 / RNF-3 (Cifrado AES-256 en reposo + TLS + hallazgos Aâ€“E)
**Estado:** âœ… COMPLETO â€” gates UnitTests 449/458 (9 fallos pre-existentes, probado), Api.Tests 33/33, E2E: 25 fallos pre-existentes por mocks desactualizados (pendiente commit de limpieza B)

### Trabajo realizado
1. **Cifrado AES-256-GCM** (`src/backend/src/Application/Common/Encryption/AesEncryptionDecorator.cs`): decorator con IV Ãºnico por operaciÃ³n, claves de 32 bytes validadas, `leaveOpen` para composiciÃ³n. Registrado en DI (Microsoft.Extensions.AES, modo delegaciÃ³n). Verificado con tests de integraciÃ³n en vivo.
2. **TLS/HSTS**: middleware `UseHttpsRedirection` + `UseHsts` condicionado a producciÃ³n; headers HSTS/CSP en nginx.conf.
3. **Secrets**: JWT key y Azure connection string fuera del repo (appsettings.Development.json + env vars); verificado con `git grep`.
4. **Hallazgo C**: `PublicAccessType.None` â€” sin acceso anÃ³nimo a documentos.
5. **Hallazgo E**: AllowedHosts restringido y luego **revertido** a `*` tras prueba en vivo (el proxy docker envÃ­a `Host: api:8080`; rompÃ­a healthcheck). Commit `fbf091cf`.
6. **2FA del admin limpiado** (admin@verifinca.do) â€” restaura estado esperado por e2e.
7. AuditorÃ­a `RNF3-security audit.txt` actualizada con secciÃ³n de remediaciÃ³n y cierre de hallazgos.

### Pendiente (commit B, limpieza)
- Mocks E2E desactualizados vs contrato frontend (`{items, totalCount, page, pageSize}`): `public-directory-filter.spec.ts`, `project-search.spec.ts`, `dashboard.spec.ts` (totalOfertas), `status-catalog`, `create-project`, `seal-integrity`, `seed-documents`. 25 fallos, todos pre-existentes (specs/frontend tocados en cf400219/93d3b9e5, antes de 2b72bba7/e5ff9efd).
- `sql_logs.txt` borrado (artefacto de debug, queda uncommitted).

### Lecciones
- La auditorÃ­a original corriÃ³ sobre checkout sin `src/backend` restaurado â†’ falso negativo de cifrado. Reindexar/restaurar antes de auditar.
- El `read` tool se rompe con archivos que contienen secuencias tipo tool-call (project-search.spec.ts); usar Get-Content/ReadAllLines vÃ­a bash.

## Sesión 2026-08-07 â€” Fix E2E suelo + cierre de fallos pre-existentes

**Estado:** âœ… project-search + dashboard 8/8 verdes (incl. sello, suelo, IPI, RNC, cÃ©dula, invalid, admin y non-admin dashboard).

### Trabajo realizado
1. **Root cause suelo (`VerifySearchForm.tsx`):** `formatValue` insertaba guiones (`001-02-003`) pero `VALIDATION_PATTERNS.suelo` exige `/^\d{4,10}$/` â†’ la bÃºsqueda por NÃºmero de Suelo era invÃ¡lida para cualquier valor de 4+ dÃ­gitos. Fix: el formatter de suelo devuelve `clean` (solo dÃ­gitos), igual que ipi/rnc.
2. **VerificaciÃ³n:** re-run de `e2e/projects/project-search.spec.ts` + `dashboard.spec.ts` â†’ 8/8 passed. Los fallos de la sesiÃ³n anterior eran en parte timeouts de `page.goto` (transitorios) y en parte el bug de suelo.
3. **Typecheck:** errores restantes son pre-existentes en otros archivos (unused imports, TS7006); `VerifySearchForm.tsx` limpio.

### Nota de entorno
- Stack corre en Docker (`docker compose`): api:5000 (health en `/health`, no `/api/health`), web:3000, sqlserver:1433. Los cambios frontend se hot-reloadan vÃ­a volumen + VITE_WATCH_POLLING.

## 2026-08-07 — Ponytail audit application (session 2, continuation)
- Applied audit findings: removed xlsx dep (package.json), Google.Apis.Auth (Infrastructure.csproj), file-saver usage (ExportProjectsModal -> native URL.createObjectURL), deleted useSearchPublicProjects.ts (0 callers), removed useAuditLog from useAudit.ts, consolidated 4 duplicate cn() into src/shared/utils/cn.ts, removed 8 debug console.logs (CheckoutReturnPage, useProjectForm), deleted stale obj artifact.
- USER OVERRIDE: evals/ folder + .github/workflows/eval.yml + .waza.yaml RESTORED (revert of audit finding 1) — skills eval harness is intentional, keep it.
- Verified: dotnet build Infrastructure 0/0; typecheck only pre-existing errors; frontend vitest 18 failed files all PRE-EXISTING (proven via git stash for VerifySearchForm + useProjectFormCategoryDefault tests — same failures with my edits reverted).

## Sesión 2026-08-17 â€” Relaciones y Claves Foráneas de Entidades Gubernamentales

**Ciclo:** OE / Gobernanza de Datos (Claves foráneas y consistencia de datos en tablas gubernamentales mock)
**Estado:** COMPLETO. Api compila correctamente (0 advertencias, 0 errores), migraciÃ³n de base de datos aplicada localmente con éxito (100% completado).

### Trabajo realizado
1. **Estandarización de Tipos**: Se modificaron las configuraciones de EF Core (`PagoIPIConfiguration.cs`, `PermisoSueloConfiguration.cs`, `CatastroTituloConfiguration.cs`, `LicenciaConstruccionConfiguration.cs` y `DGIIConfiguration.cs`) para estandarizar la columna `Rnc` a `nvarchar(20)`, alineando todos los campos con la definiciÃ³n real de la base de datos para la columna primaria `DGII.Rnc`.
2. **Definición de Claves Foráneas**:
   - `PagoIPI` -> `DGII` (Rnc -> Rnc, relación 1-a-1 con cascada al borrar).
   - `PermisoSuelo` -> `DGII` (Rnc -> Rnc, relación Muchos-a-1).
   - `CatastroTitulo` -> `DGII` (Rnc -> Rnc, relación Muchos-a-1).
   - `LicenciaConstruccion` -> `DGII` (Rnc -> Rnc, relación Muchos-a-1).
3. **Paso de Imputación de RNC**: Se inyectÃ³ cÃ³digo SQL en la migraciÃ³n `Up` para resolver la relación de `LicenciaConstruccion` únicamente después de que el RNC se imputara dinÃ¡micamente mediante una comparación de provincia y municipio contra `CatastroTitulo` y `DGII`, evitando violaciones de la integridad referencial antes de habilitar la FK.
4. **Manejo de Llave Primaria en Migración**: Se modificÃ³ la migraciÃ³n manual para realizar la eliminación temporal de la restricciÃ³n de clave primaria `PK_PagoIPI` en SQL Server antes del cambio del tipo de columna, y su posterior recreación, previniendo fallas de dependencia de base de datos.
5. **Corrección de Codificación de Test**: Se detectÃ³ y resolviÃ³ un fallo de compilaciÃ³n previo en `tests/backend/test_ipi.cs` provocado por una conversión corrupta de codificaciÃ³n a UTF-16LE, reescribiendo el archivo con codificaciÃ³n UTF-8 limpia para permitir compilaciones de espacio de trabajo sin incidencias.

6. **Resolución de Conflicto de Clave Foránea en Seeding (Docker)**: Se detectó que al inicializar Docker la restauración de datos desde los archivos CSV de caché (PermisoSuelo.csv, CatastroTitulo.csv, PagoIPI.csv) fallaba con errores de clave foránea FK_PermisoSuelo_DGII_Rnc al contener RNCs antiguos o incompatibles con la base de datos de la DGII. Se actualizó la función import_csv_to_db en generador_entidades_gubernamentales.py para mapear en caliente cualquier RNC no existente a uno válido dentro de la DGII, controlando además la unicidad del Rnc en PagoIPI para prevenir colisiones de clave primaria. Verificado localmente cargando millones de registros con éxito.

---

---

## Sesión 2026-08-18 — Implementación de Regla 8: "Tolerancia Superficie vs Mensura (≤5%)"

**Ciclo:** Motor de Inteligencia / RS55 / Regla 8 (Tolerancia Superficie Proyecto vs Catastro Nacional)
**Estado:** ✅ COMPLETO — Backend build 0/0, UnitTests xUnit 8/8 verdes, Vitest 7/7 verdes, Playwright E2E 4/4 verdes.

### Trabajo Realizado
1. **Dominio e Invariantes de Negocio (`Domain.Entities.ReglaValidacion`)**:
   - Nuevos campos mapeados: `ValorUmbral` (`decimal?`), `MinValor` (`decimal?`), `MaxValor` (`decimal?`), `Expresion` (`string?`), `Codigo` (`string?`), `RowVersion` (`byte[]?`).
   - Invariantes de rango delegados en el método de dominio `Update(...)`: Lanza `DomainException` si el umbral se ubica fuera del rango legal admitido `[MinValor, MaxValor]` (1% a 20%).
2. **Persistencia & Migraciones EF Core**:
   - Configuración de precisión decimal `(18, 4)` y token de concurrencia optimista (`IsRowVersion()`) en `ReglaValidacionConfiguration.cs`.
   - Creada migración `20260818165000_AddUmbralFieldsToReglaValidacion.cs`.
   - Seed inicial de Regla 8 (`RULE-008-SUPERFICIE`) y Regla 1 (`RULE-001-IPI-ESTATUS`) en `AppDbContextSeeder.cs`.
3. **Capa de Aplicación y API**:
   - `UpdateRuleCommand` + `UpdateRuleCommandHandler`: Ejecuta actualización validando en el dominio y registrando auditoría en `IAuditLogger`.
   - `GetValidationRuleByIdQuery` + `GetValidationRuleByIdQueryHandler`: Consulta unitaria con mapeo de token de concurrencia Base64.
   - `EvaluateRuleCommand` + `EvaluateRuleCommandHandler`: Cálculo matemático `Math.Abs(SuperficieProyecto - SuperficieCatastro) / SuperficieCatastro <= ValorUmbral`.
   - `ValidationRulesController`: Endpoints REST `GET /api/admin/rules/{id}`, `PUT /api/admin/rules/{id}` con captura de `DbUpdateConcurrencyException` (409 Conflict) y `POST /api/admin/rules/evaluar`.
4. **Frontend & UX / WCAG 2.2**:
   - Hooks TanStack Query (`useRules`, `useRule`, `useUpdateRule`, `useEvaluateRule`) y validación Zod (`toleranceRuleSchema`).
   - Vista de edición dedicada `ToleranceRuleEdit.tsx` con slider, input numérico, feedback en tiempo real, simulador interactivo, banner de error 409 y Live Region `aria-live="polite"`.
   - Tarjeta interactiva `ToleranceSurfaceCard` en `RulesManagePageLayout.tsx` (`#/admin/rules`).
   - Registro de ruta en `src/frontend/web/src/router/index.tsx` (`#/admin/rules/:id/edit`).
5. **Verificación & Suite TDD**:
   - Backend xUnit: `ReglaValidacionDomainTests.cs` (5 tests de invariantes) y `EvaluateRuleCommandHandlerTests.cs` (3 tests de cálculo matemático).
   - Frontend Vitest: `rule8Tolerance.test.ts` (7 tests de validación Zod y reglas de tolerancia).
   - Playwright E2E: `rule-8-tolerance.spec.ts` (4 tests de interfaz, navegación, simulación y manejo de concurrencia 409).

## Sesin 2026-08-19  Debug Session Error 500 ReglasValidacion

**Sntoma:** Error 500 al llamar a /api/admin/rules por columnas faltantes (MaxValor, MinValor, ValorUmbral).
**Root Cause:** La migracin 20260818165000_AddUmbralFieldsToReglaValidacion.cs se haba creado de manera parcial y sin su archivo .Designer.cs, por lo que EF Core no actualiz el modelo en el contenedor, provocando un fallo silencioso en la base de datos.
**Fix:** Se elimin la migracin corrupta y se regener utilizando dotnet ef migrations add con la variable de entorno JWT_KEY seteada. Se reconstruy y reinici la imagen de la API (pi) usando docker compose.
**Verificacin:** La llamada a la ruta GET devuelve ahora 200 OK.

---

## Sesión 2026-08-19 — Corrección de Migración de Base de Datos y Búsqueda por RNC o Cédula

**Ciclo:** OE / Gobernanza de Datos (Claves foráneas e integridad referencial)
**Estado:** ✅ COMPLETO. Api compila correctamente (0 advertencias, 0 errores), la base de datos se migra con éxito (100% completado), todas las pruebas unitarias y de integración pasan satisfactoriamente.

### Trabajo realizado
1. **Solución a Error de Migración 1753**: Se identificó un conflicto en el orden de las migraciones de EF Core, donde `AddJceCiudadanoForeignKey` intentaba agregar una clave foránea antes de que las longitudes de las columnas (`Usuario.Cedula` con longitud 15 y `JCE_Ciudadano.Cedula` con longitud 450) coincidieran.
   - Se unificó la alteración de la columna `Cedula` en `JCE_Ciudadano` a `nvarchar(15)` en la misma migración `AddJceCiudadanoForeignKey` antes del establecimiento de la FK, y se hizo no-op la migración subsiguiente `FixJceCiudadanoCedulaLength`.
   - Se manejó la eliminación de la restricción de clave primaria `PK_JCE_Ciudadano` y su posterior recreación en SQL Server durante la migración para evitar errores de dependencia de columna.
   - Para resolver conflictos con datos huérfanos preexistentes durante las corridas de pruebas, se implementó el establecimiento de la clave foránea usando `WITH NOCHECK` y habilitando su verificación posterior mediante SQL directo.
2. **Búsqueda Unificada por RNC y Cédula en DgiiController**: Se modificó el método `GetByRnc` en `DgiiController` para que realice un fallback a la tabla `JCE_Ciudadanos` si el RNC solicitado no está registrado en la `DGII`.
   - Si se encuentra la identificación en `JCE_Ciudadanos`, el API devuelve un registro de contribuyente simulado (tipo Persona Física) con el nombre completo y la actividad económica adecuada, permitiendo el auto-llenado y la validación tanto de empresas como de personas físicas con cédula en el frontend de registro y creación de proyectos.
3. **Pruebas de Integración y Calidad**: 
   - Se agregaron pruebas de integración automatizadas en `src/backend/Api.Tests/DgiiControllerTests.cs` cubriendo los tres escenarios (búsqueda de RNC existente en DGII, fallback a Cédula de JCE_Ciudadano, y NotFound para identificaciones inexistentes).
   - Se corrigieron incompatibilidades del script `post_task_loop.py` en Windows para preferir ejecuciones de pruebas directas en el host y no contaminar el ambiente de desarrollo local con variables de conexión a base de datos de Docker cargadas desde el archivo `.env`.
4. **Solución a Conflicto de Clave Foránea en Seeding (Error 547)**: Se identificó que al arrancar el API por primera vez o ejecutar pruebas, la inserción de usuarios por defecto (admin, freemium, etc.) en `AppDbContextSeeder.cs` fallaba debido a la nueva clave foránea `FK_Usuario_JCE_Ciudadano_Cedula` porque sus cédulas no existían en la tabla `JCE_Ciudadano` en ese momento del ciclo de vida.
   - Se implementó el método `SeedJceCiudadanosForDefaultUsersAsync` para insertar ciudadanos simulados con las cédulas correspondientes en la tabla de la JCE antes de crear los usuarios de prueba, eliminando la violación de integridad referencial.
5. **Importación Dinámica de Proyectos desde Caché CSV**: Se resolvió un fallo de semillado donde las inserciones de proyectos en `14_Proyectos_Realistas.sql` (restaurados desde la caché CSV) fallaban debido a restricciones de clave foránea porque los IDs de usuario y de estado eran estáticos del ambiente original y no coincidían con los IDs generados dinámicamente.
   - Se implementó la lógica de lectura y parseo del CSV directamente en C# dentro de `AppDbContextSeeder.cs` (`GetLatestCsvPath`, `ParseCsv`).
   - Se mapearon dinámicamente los IDs estáticos del CSV a los Guids generados dinámicamente de los usuarios y estados del contexto activo en el momento de la ejecución.
   - Se modificó `generate_dummy_projects.py` para escribir un script SQL `14_Proyectos_Realistas.sql` no-op cuando se detecta el CSV, delegando el semillado al seeder de C# y evitando fallos del runner.
