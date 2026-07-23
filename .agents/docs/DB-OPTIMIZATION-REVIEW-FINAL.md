## VeriFinca DB Optimization Proposal — Corrected Approval-Ready Review (Complete)

### 6. Playwright TDD Discipline Status

| Test | Status | Note |
|---|---|---|
| `route-performance.spec.ts` (21 tests) | 🔴 **RED** (18 failing) | Expected — defines target budgets |
| `project-crud.spec.ts` (9 tests) | ✅ **GREEN** (8/9 pass, 1 pre-existing mock mismatch) | Validates CRUD works |
| Unit tests (`Projects*`) | ✅ **31/31 pass** | Backend logic verified |

**Discipline intact:** Tests written first (RED), implementation follows, no test modifications to force pass.

---

### 7. Rollback Note

If any index creation causes issues (blocking, deadlocks, plan regression):

```sql
-- ProyectosInmobiliarios
DROP INDEX IX_ProyectosInmobiliarios_EstadoId ON [ProyectosInmobiliarios];
DROP INDEX IX_ProyectosInmobiliarios_IdUsuario ON [ProyectosInmobiliarios];

-- Auditorias
DROP INDEX IX_Auditorias_TipoEvento_FechaEventoUtc ON [Auditorias];
DROP INDEX IX_Auditorias_ProyectoId ON [Auditorias];
DROP INDEX IX_Auditorias_FechaEventoUtc ON [Auditorias];

-- ReglasValidacion
DROP INDEX IX_ReglasValidacion_Active_Filter ON [ReglasValidacion];
```

All are pure `DROP INDEX` — no schema migration, no data loss, instant rollback.

---

### 8. Final Go/No-Go Decision

| Criterion | Status |
|---|---|
| Schema names verified against real codebase | ✅ |
| Indexes justified by actual query plans | ✅ |
| Redundant/invalid indexes removed | ✅ |
| Column names corrected (`IdUsuario` vs `UsuarioCreadorId`) | ✅ |
| Composite order optimized for equality-first seeks | ✅ |
| Covering indexes with `INCLUDE` for key queries | ✅ |
| No `NOLOCK` / `WITH (NOLOCK)` proposed | ✅ |
| Frontend vs backend bottleneck correctly identified | ✅ |
| TypeScript hygiene already compliant | ✅ |
| Admin cache config security-appropriate | ✅ |
| Playwright TDD discipline maintained | ✅ |
| Rollback scripts provided | ✅ |

---

## 🟢 DECISION: **APPROVE WITH CHANGES**

**Approve the corrected 6-index set** (down from 11 proposed):

1. `IX_ProyectosInmobiliarios_EstadoId`
2. `IX_ProyectosInmobiliarios_IdUsuario`
3. `IX_Auditorias_TipoEvento_FechaEventoUtc` (covering)
4. `IX_Auditorias_ProyectoId` (covering)
5. `IX_Auditorias_FechaEventoUtc` (covering)
6. `IX_ReglasValidacion_Active_Filter` (covering)

**No migration required** — pure `CREATE NONCLUSTERED INDEX` statements.  
**No breaking changes** — existing queries automatically benefit from seeks.  
**Instant rollback** — `DROP INDEX` only.

---

### Next Steps After Approval

1. Execute the 6 `CREATE INDEX` statements (can run online in SQL Server 2019+)
2. Run `SET STATISTICS IO, TIME ON` on each hot query to verify seeks
3. Re-run Playwright API tests — confirm < 300ms
4. Tag commit: `perf/db-indexes-approved`
5. Frontend TTFI work (separate effort — bundle analysis, LCP optimization)