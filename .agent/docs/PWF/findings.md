# Findings - Debug date-fns Import Error

**ID**: debug-session

## Root Cause
When the React frontend was built inside the Docker container, Vite reported that it could not resolve `date-fns` from `SubscriptionSettings.tsx`. Although we had installed it on the host machine, the package wasn't available inside the container's volume-mounted `node_modules` without rebuilding/restarting the container.

## Solution & Verification
Rather than forcing a slow Docker rebuild or dependency synchronization, we refactored `SubscriptionSettings.tsx` to use only native JavaScript APIs:
- Replaced `differenceInDays` with simple millisecond date subtraction: `Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))`.
- Replaced the `format` utility with `Intl.DateTimeFormat`: `new Intl.DateTimeFormat('es', { day: '2-digit', month: 'long', year: 'numeric' }).format(currentPeriodEnd)`.
- Removed `date-fns` from `package.json` and ran `pnpm install` to update `pnpm-lock.yaml`.

This successfully resolved the import error in Vite's compiler without adding any external dependency.
