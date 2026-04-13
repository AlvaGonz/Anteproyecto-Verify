# Featured Projects Carousel — Implementation Plan

## Objective
Refactor the FeaturedProjectsSection in LandingPage.tsx to:
1. Show **only validated projects** from mock data
2. Display the **actual validation date** per project (not hardcoded)
3. Convert to **auto-scrolling carousel** (no manual arrows)
4. Expand mock data to **10 validated + 5 invalid + 3 incomplete** projects

## Files Affected

| File | Action | Scope |
|------|--------|-------|
| `infrastructure/mock/mockProjects.ts` | MODIFY | Expand from 6 → 18 projects (10V + 5I + 3Inc) |
| `pages/LandingPage.tsx` | MODIFY | Rewrite FeaturedProjectsSection |

## Phases

### Phase 1: Expand Mock Data `status: pending`
- Add 12 new projects to `mockProjects.ts`
- Ensure 10 total have `estadoIntegridad: IntegrityStatus.Verified` + `estadoProyecto: Published/Validated`
- 5 have `IntegrityStatus.Failed` + `ProjectStatus.Rejected`
- 3 have `IntegrityStatus.Pending` + `ProjectStatus.Draft`
- Each verified project must have a realistic `updatedAtUtc` date (validation date)

### Phase 2: Refactor FeaturedProjectsSection `status: pending`
- Import `mockProjects` and filter only `IntegrityStatus.Verified`
- Remove `SAMPLE_PROJECTS` hardcoded array + `ProjectCardData` interface
- Remove `ChevronLeft`, `ChevronRight` imports (no arrows)
- Remove the `scroll()` callback and `carouselRef` (replaced by auto-scroll)
- Map `ProyectoDto` fields to card display
- Add `useEffect` auto-scroll with `setInterval` (~4s)
- Add pause-on-hover behavior
- Remove manual arrow buttons from UI
- Keep the "Ver todos" link

### Phase 3: Verify `status: pending`
- Build check (no TypeScript errors)
- Visual check in browser
- Remove unused imports
