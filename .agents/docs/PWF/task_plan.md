# Task Plan - Debug date-fns Import Error inside Docker Container

**ID**: debug-session
**Symptom**:
Vite fails to build / resolve import `date-fns` from `src/features/settings/components/SubscriptionSettings.tsx` because it's running inside a Docker container where `date-fns` is not installed in the container's `node_modules` volume.

## Analysis & Steps

### 1. Root Cause Hypothesis
The React frontend is running in a Docker container with local volume mounts. Although `date-fns` was installed on the host machine using `pnpm install`, the container's running environment (which has a cached or non-synced `node_modules` volume) did not receive/load it.
Rather than forcing a Docker rebuild/re-install, we can solve this by removing the dependency on `date-fns` completely, adhering to the `ponytail.md` lazy senior developer principle (use standard library/native features instead of third-party libraries).

### 2. Steps to Resolve
1. **Remove Dependency**: Replace all `date-fns` and `date-fns/locale` usage in `SubscriptionSettings.tsx` with native Javascript:
   - Use `new Intl.DateTimeFormat('es', ...)` for Spanish date formatting.
   - Use simple date subtraction and `Math.ceil` for days remaining difference.
2. **Remove package.json reference**: Remove `date-fns` from `src/frontend/web/package.json` to keep package list clean.
3. **Verify Build**: Run `pnpm run build` inside `src/frontend/web` to ensure compilation succeeds.
