# Findings: Frontend Technical Debt Audit

## Structural Discoveries
- Stale, orphaned `.pnpm` folders exist in `node_modules/.pnpm` (specifically `vite@5.4.21` and `vite@6.4.2`), causing editor type-check resolution conflicts while the lockfile itself was correctly locked to `vite@6.2.0`.
- Missing peer dependency alignment/overrides allowed pnpm to fetch and cache these multiple versions previously.

## Architecture Boundary Violations
- (To be analyzed in subsequent steps as required)

## Duplicate/Ambiguous Files
- Stale cache files and multiple duplicate configurations exist due to untracked/uncleaned node_modules virtual store.
- **Stale TypeScript Build Cache (`.tsbuildinfo`)**: Stale build cache files (e.g. `tsconfig.node.tsbuildinfo`) in `src/frontend/web` and `dist-node` contained serialized resolved paths to the old packages (like `@types/react@19.2.15` and `@types/node@22.19.19`), causing the editor's TypeScript Language Server to attempt loading non-existent directories and throwing false type errors. Deleting them and running a clean build successfully regenerated correct cache files.

## Findings for Task B: i18n Setup & react-i18next Fixes
- Task initiated. Analyzing missing package `react-i18next` and associated build issues.
- Need to locate root `package.json`, frontend package.json, `tsconfig.json`, and current i18n configuration.
- **Discovery**: Inside `src/frontend/web/package.json`, both `"i18next": "24.2.2"` and `"react-i18next": "15.4.0"` are already declared as dependencies.
- **Hypothesis**: The dependencies might be declared but not installed or built in `node_modules` because of an incomplete `pnpm install` run or cache resolution issues.
- **Next steps**: Check the root `package.json` and investigate the existence of `src/i18n.ts` and `src/main.tsx` files.
- **Discovery (i18n.ts)**: `src/i18n.ts` actually exists and contains inline translations under `resources` for `es` and `en` with domains `documentList`, `projectsList`, `documentUpload`, and `hero`. It currently uses `lng: 'es'` as default.
- **Discovery (main.tsx)**: `src/main.tsx` already imports `./i18n` correctly before `<App />`. However, it does not wrap `<App />` in `<React.Suspense>`.
- **Constraint check**: The user requested translations go in `public/locales/{lang}/common.json` with `i18next-http-backend`, and `react-i18next` should use TypeScript namespace augmentation. So we need to:
  1. Move the inline translations to `public/locales/es/common.json` and `public/locales/en/common.json`.
  2. Implement the `i18n.ts` using `HttpBackend` and `LanguageDetector` as instructed.
  3. Ensure types are correctly augmented for the `'common'` namespace.
  4. Wrap the root component in `<React.Suspense>` to handle async loading of namespaces.
- **Backend CORS status check**: Checked `ServiceCollectionExtensions.cs` and `ApplicationBuilderExtensions.cs`. Both are using `"AllowFrontend"` correctly. There is no mismatch or build-breaking inconsistency here. It is fully aligned.
