# Task Plan: i18n Setup, react-i18next Integration, and AuditLogPage Internationalization

## Goal
Fix the broken Vite build caused by the missing `react-i18next` dependency and the 500 internal server error on `src/i18n.ts` in `main.tsx`. Standardize translations into static JSON files loaded asynchronously via `i18next-http-backend`, configure TypeScript type safety namespace augmentation, and internationalize `AuditLogPage.tsx` to clear 16 JSX internationalization compiler warnings.

## Current Phase
Phase 1: Setup & Package Installation

## Phases

### Phase 1: Package Installation & Base Setup
- [ ] Run `pnpm add react-i18next i18next i18next-http-backend i18next-browser-languagedetector` in `src/frontend/web`
- [ ] Verify `node_modules` successfully installs packages with zero workspace conflicts
- [ ] Configure `src/frontend/web/src/i18n.ts` to use `i18next-http-backend` and `i18next-browser-languagedetector`
- **Status:** in_progress

### Phase 2: Translation Resource Files & Type Augmentation
- [ ] Extract the existing translations in `i18n.ts` and migrate them to:
  - `src/frontend/web/public/locales/es/common.json` (Spanish)
  - `src/frontend/web/public/locales/en/common.json` (English)
- [ ] Add new namespaces for the `audit` logging page translations to both JSON files
- [ ] Create `src/frontend/web/src/react-i18next.d.ts` for typescript namespace augmentation (to ensure types are checked for translation keys)
- **Status:** pending

### Phase 3: Root Application Suspense Wrapper
- [ ] Open `src/frontend/web/src/main.tsx`
- [ ] Ensure `import './i18n';` is the first import after React/ReactDOM imports, before `<App />`
- [ ] Wrap `<App />` in `<React.Suspense>` to handle asynchronous translation file downloading without UI flashing or crashing
- **Status:** pending

### Phase 4: Internationalizing AuditLogPage.tsx
- [ ] Add `useTranslation` hook inside `AuditLogPage.tsx`
- [ ] Surgical substitution of all 16 hardcoded Spanish JSX strings with `t('audit.something')` calls
- [ ] Update both English and Spanish JSON files in `public/locales` to hold the exact values for the 16 substituted strings
- **Status:** pending

### Phase 5: Verification & Compilation Test
- [ ] Run Vite dev server with zero startup errors
- [ ] Confirm no 500 or 404 errors for locale JSONs in the browser dev tools
- [ ] Verify UI rendering and functional behavior of `DocumentUploadForm` and `AuditLogPage`
- [ ] Run `pnpm run build` to verify clean TypeScript compilation and successful bundler build
- **Status:** pending

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use standard `i18next-http-backend` | Avoids large inline translation bundles in JS chunks, enabling faster initial page loads and clean static JSON structure |
| Wrap in `<React.Suspense>` | Necessary when using `HttpBackend` because translation namespaces are loaded asynchronously at runtime |
| Add TypeScript Namespace Augmentation | Ensures all translation key paths used with `t()` are type-checked against the actual JSON schema, preventing runtime typo bugs |
