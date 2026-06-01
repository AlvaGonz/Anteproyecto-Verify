# Task Plan: Frontend Technical Debt Audit

## Status: IN_PROGRESS
**Target:** src/frontend/web/
**Branch:** genspark-frontend
**Date:** 2026-04-14

---

## Phase 1: Context Mapping & Skills Discovery (READ-ONLY)
- [ ] Task 1.1: Map current structure (package.json, tsconfig, vite.config, directory listing)
- [ ] Task 1.2: Identify and select agent skills from `.agent/skills/`
- [ ] Task 1.3: Generate initial `TECH_DEBT_AUDIT.md` report

## Phase 2: Implementation & Safe Cleanup (ATOMIC COMMITS)
- [ ] Task 2.1: Cleanup build artifacts using `gitignore-cleanup`
- [ ] Task 2.2: Resolve `vite.config.ts` vs `vite.config.js` conflict
- [ ] Task 2.3: Audit and document `pages/` vs `features/` consolidation
- [ ] Task 2.4: Generate missing barrel `index.ts` files
- [ ] Task 2.5: Audit deep relative imports and TS aliases
- [ ] Task 2.6: Update `TECH_DEBT_AUDIT.md` with actions and backlog

## Phase 3: Technical Validation & Verification
- [ ] Task 3.1: Full validation (tsc, lint, build, untracked files)
- [ ] Task 3.2: Final quality checklist verification
- [ ] Task 3.3: Final push to `genspark-frontend`

---

## Error Log
*(No errors encountered yet)*
