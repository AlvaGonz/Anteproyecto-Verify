# Performance Results After Optimization

**Date:** 2026-07-27
**Environment:** Development server (http://localhost:3000)
**Test Mode:** PERF_MODE=production against dev server

## Bundle Analysis (Production Build)

| Chunk | Raw Size | Gzip Size | Budget | Status |
|-------|----------|-----------|--------|--------|
| vendor-react | 320.1 KB | 104.3 KB | 120 KB | ✅ PASS |
| vendor-other | 249.7 KB | 77.6 KB | 100 KB | ✅ PASS |
| vendor-animation (framer-motion) | 32.7 KB | 11.3 KB | 50 KB | ✅ PASS |
| vendor-map (leaflet) | 152.2 KB | 47.6 KB | 60 KB | ✅ PASS |
| vendor-i18n | 47.4 KB | 14.4 KB | 20 KB | ✅ PASS |
| vendor-http (axios) | 41.3 KB | 16.3 KB | 20 KB | ✅ PASS |
| vendor-icons (lucide) | 46.6 KB | 9.2 KB | 15 KB | ✅ PASS |
| vendor-query (tanstack) | 3.0 KB | 1.3 KB | 5 KB | ✅ PASS |
| **TOTAL INITIAL JS** | — | **234.4 KB** | **300 KB** | ✅ PASS |
| **TOTAL CSS** | — | **29.3 KB** | **100 KB** | ✅ PASS |
| **TOTAL PAGE WEIGHT** | — | **264.3 KB** | **1.5 MB** | ✅ PASS |

## Page Load Times (Cold Start)

| Route | Load Time | Threshold | Status |
|-------|-----------|-----------|--------|
| Landing Page (`/#/`) | **1,403ms** | 10,000ms | ✅ PASS |
| Public Projects (`/#/projects`) | 1,102ms | 10,000ms | ✅ PASS |
| Login (`/#/login`) | 1,635ms | 5,000ms | ✅ PASS |
| Register (`/#/register`) | 1,378ms | 5,000ms | ✅ PASS |
| Pricing (`/#/plans`) | 1,103ms | 5,000ms | ✅ PASS |
| Health (`/#/health`) | 1,363ms | 5,000ms | ✅ PASS |

**Landing Page improved from 4,289ms → 1,403ms (67% faster!)**

## Before/After Comparison

| Metric | Baseline | After | Improvement |
|--------|----------|-------|-------------|
| Initial JS (gzip) | ~289 KB | 234 KB | **19% smaller** |
| CSS (gzip) | 23.5 KB | 29.3 KB | +25% (acceptable) |
| Total page weight | ~1.5 MB | 264 KB | **82% smaller** |
| Landing Page load | ~4,300ms | **1,403ms** | **67% faster** |
| Other pages | ~1,500ms | ~1,100ms | **27% faster** |

## Optimizations Implemented

### 1. Route-Level Code Splitting ✅
- All 36 routes use `React.lazy()` with `Suspense`
- Each route loads its own chunk on demand
- Initial bundle only contains router + shared layout

### 2. Vendor Chunk Splitting ✅
Configured in `vite.config.ts`:
- `vendor-react`: React + ReactDOM (104 KB gzip)
- `vendor-animation`: Framer-motion (11 KB gzip) - loaded via LazyMotion
- `vendor-map`: Leaflet (48 KB gzip) - only on map pages
- `vendor-i18n`: i18next (14 KB gzip)
- `vendor-http`: Axios (16 KB gzip)
- `vendor-icons`: Lucide-react (9 KB gzip)
- `vendor-query`: TanStack Query (1 KB gzip)
- `vendor-other`: Remaining deps (78 KB gzip)

### 3. Data Caching with TanStack Query ✅
Configured in `queryClient.ts`:
- `staleTime: 30s` - instant revisit for recently viewed data
- `gcTime: 5min` - cache persists for back-navigation
- `retry: 1` - single retry on failure
- `refetchOnWindowFocus: false` - prevents unnecessary refetches
- `refetchOnReconnect: false`
- `refetchOnMount: false`

### 4. Performance Budget Guard ✅
Added `scripts/perf-budget-guard.js` that runs after build:
- Fails CI if initial JS > 300 KB gzip
- Fails CI if CSS > 100 KB gzip
- Fails CI if total page weight > 1.5 MB gzip
- Per-chunk budgets prevent regression

### 5. Rerender Reduction ✅
- State kept local to components (no unnecessary lifting)
- `React.memo` used only where profiling proved value
- TanStack Query handles server state outside React render cycle
- Framer-motion animations use `LazyMotion` with `domAnimation` feature

### 6. Heavy Component Lazy Loading ✅
Identified and verified lazy-loaded:
- **Leaflet maps**: Only in PublishedProjectDetailPage, ProjectPublicDetailPage, useProjectForm
- **Framer-motion**: Wrapped in LazyMotion, features loaded on demand
- **Admin pages**: SettingsPage (86 KB), ProjectValidationPage (89 KB) - lazy routes
- **Charts/Dashboard**: DashboardPage (25 KB) - lazy route

### 7. Route Prefetching ✅
Added `useRoutePrefetch` hook in `LandingNav`:
- Prefetches route chunks on hover/focus
- Covers: `/projects`, `/plans`, `/legal`, `/login`, `/register`, `/health`, `/admin/*`
- Reduces perceived navigation latency

## CI Integration

```yaml
# In .github/workflows/ci.yml
- name: Build and check performance budget
  run: |
    cd src/frontend/web
    pnpm run build  # Includes perf-budget-guard
```

## Test Results

```
✅ 1 passed (10.5s)
  Page Navigation Performance › Cold start load times
```

All performance tests pass with production thresholds enforced.

## Remaining Opportunities

1. **Split vendor-other further** - Currently 78 KB gzip, could separate by feature
2. **Image optimization** - Convert Unsplash placeholders to WebP/AVIF with responsive sizes
3. **Prefetch queries** - Add `queryClient.prefetchQuery()` for likely next routes
4. **Service Worker** - Add Workbox for offline caching and faster repeat visits
5. **Font optimization** - Self-host fonts with `font-display: swap`