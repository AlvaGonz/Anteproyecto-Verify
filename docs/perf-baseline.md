# Performance Baseline Metrics

**Date:** 2026-07-27
**Environment:** Development server (http://localhost:3000)
**Test Mode:** PERF_MODE=production against dev server

## Bundle Analysis (Production Build)

| Chunk | Size (gzip) | Notes |
|-------|-------------|-------|
| vendor-react | 106.80 kB | React + ReactDOM |
| vendor-other | 79.44 kB | Misc node_modules |
| vendor-map | 48.72 kB | Leaflet |
| vendor-i18n | 14.70 kB | i18next |
| vendor-http | 16.66 kB | Axios |
| vendor-icons | 9.46 kB | Lucide-react |
| vendor-animation | 11.58 kB | Framer-motion |
| vendor-query | 1.38 kB | TanStack Query |
| **Total JS (initial)** | **~289 kB gzip** | Excludes lazy-loaded routes |
| **CSS** | **23.50 kB gzip** | Main stylesheet |

## Page Load Times (Cold Start)

| Route | Load Time | Threshold | Status |
|-------|-----------|-----------|--------|
| Landing Page (`/#/`) | 4,333ms | 10,000ms | ✅ PASS (API-dependent) |
| Public Projects (`/#/projects`) | 1,694ms | 10,000ms | ✅ PASS |
| Login (`/#/login`) | 2,391ms | 5,000ms | ✅ PASS |
| Register (`/#/register`) | 1,549ms | 5,000ms | ✅ PASS |
| Pricing (`/#/plans`) | 1,343ms | 5,000ms | ✅ PASS |
| Health (`/#/health`) | 1,428ms | 5,000ms | ✅ PASS |

## Largest Components (Uncompressed)

| Component | Size | Notes |
|-----------|------|-------|
| vendor-react | 327.81 kB | Core React |
| vendor-other | 255.67 kB | Misc dependencies |
| vendor-map | 155.84 kB | Leaflet |
| ProjectValidationPage | 87.60 kB | Heavy admin page |
| SettingsPage | 85.70 kB | Settings with forms |
| ProjectManagePage | 30.13 kB | Project management |
| ProjectPublicDetailPage | 33.26 kB | Public detail with map |
| DashboardPage | 24.36 kB | Dashboard with charts |

## Current Optimizations in Place

✅ Route-level code splitting (all routes use React.lazy)
✅ TanStack Query configured with staleTime: 30s, gcTime: 5min
✅ Manual chunks for vendor bundles
✅ Tree-shaking enabled (ES modules)
✅ CSS code splitting

## Areas for Improvement

1. **Heavy components not lazy loaded:** Charts, maps, editors, PDF viewers load in initial chunks
2. **Vendor-other chunk (255 kB):** Contains many small modules that could be split
3. **Leaflet (155 kB):** Loaded globally, should be lazy loaded for map pages only
4. **Framer-motion (33 kB):** Loaded globally, could be deferred
5. **Images:** Unsplash images used as placeholders, not optimized
6. **No performance budget guard** in CI

## Target Metrics After Optimization

- Initial JS gzip: ≤ 300 KB (currently ~289 KB - already within budget)
- CSS gzip: ≤ 100 KB (currently 23.5 KB - well within budget)
- Total initial page weight: ≤ 1.5 MB
- Landing Page cold start: < 3,000ms (currently 4,333ms - API-bound)
- Other pages: < 1,500ms