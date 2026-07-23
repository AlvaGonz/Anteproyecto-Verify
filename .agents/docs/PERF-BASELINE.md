# VeriFinca Performance Baseline

**Generated:** 2026-07-23  
**Purpose:** Document baseline performance before optimization phases

---

## Target Routes & Budgets

| Route | Cold TTFI Budget | Cached Revisit Budget | Notes |
|-------|------------------|----------------------|-------|
| `/#/` (Landing) | < 300ms | < 100ms | Public, no auth |
| `/#/projects` (Public List) | < 300ms | < 100ms | Public, uses `/api/projects` |
| `/#/plans` (Pricing) | < 300ms | < 100ms | Public |
| `/#/legal` | < 300ms | < 100ms | Public |
| `/#/admin/dashboard` | < 300ms | < 100ms | Auth required, admin |
| `/#/admin/projects` | < 300ms | < 100ms | **BASELINE ROUTE** — currently fast (~300ms) |
| `/#/admin/rules` | < 300ms | < 100ms | Auth required, admin |
| `/#/admin/audit-log` | < 300ms | < 100ms | Auth required, admin |
| `/#/admin/settings` | < 300ms | < 100ms | Auth required, admin |

---

## Hot API Endpoints

| Endpoint | Current Issues | Target Response |
|----------|----------------|-----------------|
| `GET /api/projects` | No pagination, loads all with `.Include()` chains, no indexes on `EstadoId`, `UsuarioCreadorId` | < 300ms |
| `GET /api/admin/audit` | Loads ALL audit logs, filters in memory, no indexes on `FechaEventoUtc`, `TipoEvento`, `ProyectoId` | < 300ms |
| `GET /api/admin/rules` | Loads all rules, no pagination, no projection | < 300ms |
| `GET /api/projects/:id` | N+1 risk with `.Include().ThenInclude()` | < 200ms |

---

## Frontend Observations

### Router (`src/frontend/web/src/router/index.tsx`)
- ✅ All routes use `React.lazy()` for code splitting
- ✅ Single `SuspenseLayout` with minimal fallback
- ⚠️ Admin routes **re-mount `AdminLayout`** on every navigation (line 215-352)
  - Each admin route wraps `<AdminLayout>` independently
  - This causes layout remount on every route change
- ⚠️ No route prefetch on hover

### TanStack Query (`src/frontend/web/src/infrastructure/api/queryClient.ts`)
- ❌ `staleTime: 5 min` — too long for instant revisits
- ❌ No `gcTime` configured (defaults to 5 min)
- ❌ No per-query key factories for filters/pagination

### Query Hooks (sample: `useProjects.ts`)
- ✅ Uses `useQuery` with `staleTime: 30s` override
- ⚠️ `projectKeys.all` doesn't include filters — can't cache filtered views separately
- ✅ Mutations properly invalidate

---

## Backend Observations

### ProyectoRepository
| Method | Issues |
|--------|--------|
| `GetAllAsync()` | `.Include(p => p.UsuarioCreador).ThenInclude(u => u.Plan).Include(p => p.Estado)` — loads full entities, no projection |
| `GetVisibleAsync()` | Same includes + `.Where(p => p.Estado.CodigoUnico != draftCode)` — filter in memory after loading |
| `SearchAsync()` | Complex OR with subquery on `SelloIntegridad` — may need index |

### AuditoriaRepository
| Method | Issues |
|--------|--------|
| `GetAllAsync()` | `AsNoTracking().ToListAsync()` — loads entire table, no filters, no pagination |

### ReglaValidacionRepository
| Method | Issues |
|--------|--------|
| `GetAllAsync()` | `AsNoTracking().OrderByDescending().ToListAsync()` — loads all, no projection |

---

## Database Schema Gaps (per ProyectoConfiguration)

### ProyectosInmobiliarios
- ✅ PK on `IdProyecto`
- ✅ Unique index on `CodigoInterno`
- ❌ **No index on `EstadoId`** (used in `GetVisibleAsync` filter)
- ❌ **No index on `UsuarioCreadorId`** (used in auth filter)
- ❌ **No index on `FechaCreacionUtc`** (potential ordering)

### Auditorias
- ❌ **No index on `FechaEventoUtc`** (audit log ordering)
- ❌ **No index on `TipoEvento`** (audit log filter)
- ❌ **No index on `ProyectoId`** (project-scoped queries)

### ReglasValidacion
- ❌ **No index on `FechaCreacionUtc`** (ordering)
- ❌ **No composite index on `(Activa, TipoProyecto, TipoDocumentoAplicable)`** (GetActiveRulesAsync)

---

## Measurement Protocol (Phase 0)

### Database Profiling
```sql
-- Run per endpoint
SET STATISTICS TIME ON;
SET STATISTICS IO ON;

-- Example for /api/projects
SELECT * FROM ProyectosInmobiliarios 
WHERE EstadoId != (SELECT Id FROM ProyectoEstados WHERE CodigoUnico = 'CREADO')
-- Record: logical reads, CPU time, elapsed time
```

### Browser Profiling (Playwright)
```typescript
// Capture trace for each route
await page.goto('/#/admin/projects');
await page.waitForSelector('[data-testid="project-row"]');
// Measure: navigationStart -> firstContentfulPaint -> interactive
```

### Metrics to Capture
| Metric | Tool | Threshold |
|--------|------|-----------|
| DB Logical Reads | `SET STATISTICS IO` | < 1000 per query |
| DB CPU Time | `SET STATISTICS TIME` | < 50ms |
| DB Elapsed Time | `SET STATISTICS TIME` | < 100ms |
| TTFI (Time to First Interactive) | Playwright + Performance API | < 300ms cold, < 100ms cached |
| JS Bundle Size (gzipped) | `vite build --mode production` | < 200KB initial, < 50KB per route chunk |

---

## Commit Baseline
```bash
git commit -m "perf: baseline measurements — no code changes"
```