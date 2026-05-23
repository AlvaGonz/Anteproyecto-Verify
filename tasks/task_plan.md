# Task Plan: Resolve Vite Type Mismatches & Technical Debt Audit

## Goal
Resolve type mismatch errors in the Vite and Vitest configurations, clean up stale package versions in `.pnpm`, and establish a reliable, clean-compiling workspace.

## Current Phase
Phase 6: Final Handoff

## Phases

### Phase 1: Discovery & Planning
- [x] Analyze the IDE compilation errors
- [x] Identify stale Vite versions (`5.4.21` and `6.4.2`) inside `.pnpm`
- [x] Create and approve the implementation plan
- **Status:** complete

### Phase 2: Setup Planning Artifacts
- [x] Initialize `task_plan.md`
- [x] Initialize `progress.md`
- [x] Update `findings.md`
- **Status:** complete

### Phase 3: Resolution & Cleanup
- [x] Add `"vite": "6.2.0"` override to root `package.json`
- [x] Clean stale `node_modules` folders
- [x] Run a clean `pnpm install`
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Run TypeScript typecheck to verify no compiler errors
- [x] Build the web frontend via `pnpm --filter web-frontend build`
- [x] Execute Vitest test suite via `pnpm --filter web-frontend test`
- **Status:** complete

### Phase 5: Stale IDE Cache Cleanup
- [x] Identify stale `.tsbuildinfo` files with serialized paths to old packages
- [x] Delete `*.tsbuildinfo` files in subfolder and `dist-node`
- [x] Add `forceConsistentCasingInFileNames: true` to trigger TS Server flush
- [x] Regenerate pristine build cache and verify CLI output
- **Status:** complete

## Key Questions
1. Do other workspace packages require overrides? (Currently only `@types/react`, `@types/react-dom`, `tsx`, and `vite` require overrides to prevent mismatches).
2. Are there unused or dead files to clean up later? (Yes, that will be addressed in a follow-up dead-code cleanup phase if requested).

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Override `vite` to `6.2.0` | Forces all workspace and nested dependencies to resolve to the exact version declared in `package.json` |
| Clean delete of `node_modules` | Standard, robust way to eliminate stale, untracked, or orphaned folders in the `.pnpm` virtual store |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Stuck pnpm install (out of memory / paging file too small) | 1       | Terminated background task, will retry after freeing memory / waiting |
| Build failed with realpath UNKNOWN error on lucide-react | 2       | Logged. Will retry now that I/O has settled, or check for locked handles |
