# PWF Progress — VeriFinca

## Sesión 2026-08-07 — Remediación RNF-3 (finalización)

**Ciclo:** OH-8 / RNF-3 (Cifrado AES-256 en reposo + TLS + hallazgos A–E)
**Estado:** ✅ COMPLETO — gates UnitTests 449/458 (9 fallos pre-existentes, probado), Api.Tests 33/33, E2E: 25 fallos pre-existentes por mocks desactualizados (pendiente commit de limpieza B)

### Trabajo realizado
1. **Cifrado AES-256-GCM** (`src/backend/src/Application/Common/Encryption/AesEncryptionDecorator.cs`): decorator con IV único por operación, claves de 32 bytes validadas, `leaveOpen` para composición. Registrado en DI (Microsoft.Extensions.AES, modo delegación). Verificado con tests de integración en vivo.
2. **TLS/HSTS**: middleware `UseHttpsRedirection` + `UseHsts` condicionado a producción; headers HSTS/CSP en nginx.conf.
3. **Secrets**: JWT key y Azure connection string fuera del repo (appsettings.Development.json + env vars); verificado con `git grep`.
4. **Hallazgo C**: `PublicAccessType.None` — sin acceso anónimo a documentos.
5. **Hallazgo E**: AllowedHosts restringido y luego **revertido** a `*` tras prueba en vivo (el proxy docker envía `Host: api:8080`; rompía healthcheck). Commit `fbf091cf`.
6. **2FA del admin limpiado** (admin@verifinca.do) — restaura estado esperado por e2e.
7. Auditoría `RNF3-security audit.txt` actualizada con sección de remediación y cierre de hallazgos.

### Pendiente (commit B, limpieza)
- Mocks E2E desactualizados vs contrato frontend (`{items, totalCount, page, pageSize}`): `public-directory-filter.spec.ts`, `project-search.spec.ts`, `dashboard.spec.ts` (totalOfertas), `status-catalog`, `create-project`, `seal-integrity`, `seed-documents`. 25 fallos, todos pre-existentes (specs/frontend tocados en cf400219/93d3b9e5, antes de 2b72bba7/e5ff9efd).
- `sql_logs.txt` borrado (artefacto de debug, queda uncommitted).

### Lecciones
- La auditoría original corrió sobre checkout sin `src/backend` restaurado → falso negativo de cifrado. Reindexar/restaurar antes de auditar.
- El `read` tool se rompe con archivos que contienen secuencias tipo tool-call (project-search.spec.ts); usar Get-Content/ReadAllLines vía bash.

## Sesión 2026-08-07 — Fix E2E suelo + cierre de fallos pre-existentes

**Estado:** ✅ project-search + dashboard 8/8 verdes (incl. sello, suelo, IPI, RNC, cédula, invalid, admin y non-admin dashboard).

### Trabajo realizado
1. **Root cause suelo (`VerifySearchForm.tsx`):** `formatValue` insertaba guiones (`001-02-003`) pero `VALIDATION_PATTERNS.suelo` exige `/^\d{4,10}$/` → la búsqueda por Número de Suelo era inválida para cualquier valor de 4+ dígitos. Fix: el formatter de suelo devuelve `clean` (solo dígitos), igual que ipi/rnc.
2. **Verificación:** re-run de `e2e/projects/project-search.spec.ts` + `dashboard.spec.ts` → 8/8 passed. Los fallos de la sesión anterior eran en parte timeouts de `page.goto` (transitorios) y en parte el bug de suelo.
3. **Typecheck:** errores restantes son pre-existentes en otros archivos (unused imports, TS7006); `VerifySearchForm.tsx` limpio.

### Nota de entorno
- Stack corre en Docker (`docker compose`): api:5000 (health en `/health`, no `/api/health`), web:3000, sqlserver:1433. Los cambios frontend se hot-reloadan vía volumen + VITE_WATCH_POLLING.
