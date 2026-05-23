# Findings: Frontend Technical Debt Audit

## Structural Discoveries
- Stale, orphaned `.pnpm` folders exist in `node_modules/.pnpm` (specifically `vite@5.4.21` and `vite@6.4.2`), causing editor type-check resolution conflicts while the lockfile itself was correctly locked to `vite@6.2.0`.
- Missing peer dependency alignment/overrides allowed pnpm to fetch and cache these multiple versions previously.

## Architecture Boundary Violations
- (To be analyzed in subsequent steps as required)

## Duplicate/Ambiguous Files
- Stale cache files and multiple duplicate configurations exist due to untracked/uncleaned node_modules virtual store.
- **Stale TypeScript Build Cache (`.tsbuildinfo`)**: Stale build cache files (e.g. `tsconfig.node.tsbuildinfo`) in `src/frontend/web` and `dist-node` contained serialized resolved paths to the old packages (like `@types/react@19.2.15` and `@types/node@22.19.19`), causing the editor's TypeScript Language Server to attempt loading non-existent directories and throwing false type errors. Deleting them and running a clean build successfully regenerated correct cache files.
