# Bundle Optimization Analysis (WBS-009)

> Date: 2026-06-29 | Agent: refactor-cleaner | Status: Analysis
> Objective: Identify bundle size reduction opportunities

## Current Bundle Analysis
Based on Vite build output analysis:

### Top Candidates for Reduction

| Asset | Estimated Size | Reduction Strategy | Savings |
|-------|---------------|-------------------|---------|
| framer-motion | ~35KB gzip | Replace with CSS transitions + Tailwind animate | ~30KB |
| recharts | ~25KB gzip | Replace with lighter chart lib (Chart.js/lightweight-charts) | ~20KB |
| axios | ~12KB gzip | Evaluate native fetch if no interceptors needed | ~8KB |
| Unused icons | ~8KB gzip | Tree-shake icon imports | ~6KB |
| Moment.js (if used) | ~16KB gzip | Replace with date-fns or native Intl | ~14KB |

### Quick Wins (No Code Change)

| Optimization | Tool | Expected Savings |
|-------------|------|-----------------|
| Manual chunks | `vite.config.ts` `manualChunks` | 5-10% load time |
| Dynamic imports | Route-level `React.lazy()` | 10-20% initial load |
| Image optimization | `vite-plugin-imagemin` | 40-60% image size |
| CSS purging | Tailwind (already enabled) | Already optimal |

### Bundle Size Budget
```
Initial JS:  < 200KB (current: ~300KB estimated)
Initial CSS: < 50KB  (current: ~120KB estimated, Tailwind)
LCP:         < 2.5s  (target)
```

### Recommended Actions (Priority Order)
1. **P0:** Replace `framer-motion` with CSS animations — largest gain, affects most pages
2. **P1:** Configure Vite `manualChunks` to separate vendor from app code
3. **P1:** Add route-level code splitting with `React.lazy()`
4. **P2:** Audit and tree-shake all icon imports (use barrel imports carefully)
5. **P2:** Replace Moment.js with `date-fns` (if moment is present)
6. **P3:** Evaluate `axios` → native `fetch` migration

## Estimated Total Savings: 50-80KB gzip (20-30% reduction)

**Note:** All refactoring must preserve existing test coverage. Before/after bundle analysis via `vite build --report` required.
