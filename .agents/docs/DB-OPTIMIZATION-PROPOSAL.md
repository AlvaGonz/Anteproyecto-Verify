# VeriFinca Database Index & Schema Optimization Proposal

**Status:** 🛑 **HUMAN GATE REQUIRED** — Awaiting approval before migration/index creation  
**Based on:** `.agents/docs/PERF-BASELINE.md` + backend query analysis  
**Generated:** 2026-07-23

---

## Executive Summary

Backend API response times are now <50ms (excellent). The bottleneck has shifted to **frontend TTFI** (~1.7-2.5s cold). However, adding targeted database indexes will:
1. Future-proof against data growth
2. Eliminate any potential table scans on filter columns
3. Support the new pagination endpoints efficiently

---

## Recommended Indexes (No Migration Required — Pure CREATE INDEX)

### 1. ProyectosInmobiliarios Table

| Index Name | Columns | Type | Rationale |
|------------|---------|------|-----------|
| `IX_ProyectosInmobiliarios_EstadoId` | `EstadoId` | Non-clustered | `GetVisibleAsync` filters on `Estado.CodigoUnico` (joins via EstadoId) |
| `IX_ProyectosInmobiliarios_UsuarioCreadorId` | `UsuarioCreadorId` | Non-clustered | Auth filter in `GetProjects` for non-admin users |
| `IX_ProyectosInmobiliarios_FechaCreacionUtc` | `CreatedAtUtc` | Non-clustered | Potential ordering/filtering by creation date |
| `IX_ProyectosInmobiliarios_CodigoInterno` | `CodigoInterno` | **Already exists (Unique)** | — |

**Expected Impact:** Index seeks instead of scans on filter columns; logical reads ↓ 60-80%

---

### 2. Auditorias Table

| Index Name | Columns | Type | Rationale |
|------------|---------|------|-----------|
| `IX_Auditorias_FechaEventoUtc` | `FechaEventoUtc` | Non-clustered | `GetFilteredAsync` orders by `FechaEventoUtc DESC` |
| `IX_Auditorias_TipoEvento` | `TipoEvento` | Non-clustered | Filter by `TipoEvento` |
| `IX_Auditorias_ProyectoId` | `ProyectoId` | Non-clustered | `GetByProyectoIdAsync` |
| `IX_Auditorias_FechaEventoUtc_TipoEvento` | `(FechaEventoUtc, TipoEvento)` | Composite | Covering index for filtered + ordered queries |

**Expected Impact:** Eliminates sort operator; enables index seek on date range + type filter

---

### 3. ReglasValidacion Table

| Index Name | Columns | Type | Rationale |
|------------|---------|------|-----------|
| `IX_ReglasValidacion_FechaCreacionUtc` | `FechaCreacionUtc` | Non-clustered | `GetAllAsync` orders by `FechaCreacionUtc DESC` |
| `IX_ReglasValidacion_Activa_TipoProyecto_TipoDocumento` | `(Activa, TipoProyecto, TipoDocumentoAplicable)` | Composite | `GetActiveRulesAsync` exact filter match |

**Expected Impact:** Seek instead of scan for active rules filter; avoids sort

---

## Migration Scripts (Ready to Apply After Approval)

```sql
-- ProyectosInmobiliarios
CREATE NONCLUSTERED INDEX IX_ProyectosInmobiliarios_EstadoId
ON [ProyectosInmobiliarios] ([EstadoId]);

CREATE NONCLUSTERED INDEX IX_ProyectosInmobiliarios_UsuarioCreadorId
ON [ProyectosInmobiliarios] ([UsuarioCreadorId]);

CREATE NONCLUSTERED INDEX IX_ProyectosInmobiliarios_FechaCreacionUtc
ON [ProyectosInmobiliarios] ([CreatedAtUtc]);

-- Auditorias
CREATE NONCLUSTERED INDEX IX_Auditorias_FechaEventoUtc
ON [Auditorias] ([FechaEventoUtc]);

CREATE NONCLUSTERED INDEX IX_Auditorias_TipoEvento
ON [Auditorias] ([TipoEvento]);

CREATE NONCLUSTERED INDEX IX_Auditorias_ProyectoId
ON [Auditorias] ([ProyectoId]);

CREATE NONCLUSTERED INDEX IX_Auditorias_FechaEventoUtc_TipoEvento
ON [Auditorias] ([FechaEventoUtc], [TipoEvento]);

-- ReglasValidacion
CREATE NONCLUSTERED INDEX IX_ReglasValidacion_FechaCreacionUtc
ON [ReglasValidacion] ([FechaCreacionUtc]);

CREATE NONCLUSTERED INDEX IX_ReglasValidacion_Activa_TipoProyecto_TipoDocumento
ON [ReglasValidacion] ([Activa], [TipoProyecto], [TipoDocumentoAplicable]);
```

---

## Rollback Scripts (If Issues Arise)

```sql
-- ProyectosInmobiliarios
DROP INDEX IX_ProyectosInmobiliarios_EstadoId ON [ProyectosInmobiliarios];
DROP INDEX IX_ProyectosInmobiliarios_UsuarioCreadorId ON [ProyectosInmobiliarios];
DROP INDEX IX_ProyectosInmobiliarios_FechaCreacionUtc ON [ProyectosInmobiliarios];

-- Auditorias
DROP INDEX IX_Auditorias_FechaEventoUtc ON [Auditorias];
DROP INDEX IX_Auditorias_TipoEvento ON [Auditorias];
DROP INDEX IX_Auditorias_ProyectoId ON [Auditorias];
DROP INDEX IX_Auditorias_FechaEventoUtc_TipoEvento ON [Auditorias];

-- ReglasValidacion
DROP INDEX IX_ReglasValidacion_FechaCreacionUtc ON [ReglasValidacion];
DROP INDEX IX_ReglasValidacion_Activa_TipoProyecto_TipoDocumento ON [ReglasValidacion];
```

---

## Verification Plan (Post-Approval)

1. **Run `SET STATISTICS IO ON`** on each hot query
2. **Confirm:** Index Seek operators in execution plans (no Table/Index Scans)
3. **Confirm:** Logical reads reduced by ≥50%
4. **Run Playwright API tests:** `GET /api/projects`, `/api/admin/audit`, `/api/admin/rules` < 300ms
5. **Tag commit:** `perf/db-indexes-approved`

---

## Decision Required

**Approve?** → I will apply migrations and verify  
**Reject/Modify?** → Provide feedback; I'll adjust proposal  

**⚠️ No index creation will proceed without explicit human approval.**