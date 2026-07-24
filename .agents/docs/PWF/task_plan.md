# Task Plan: Debug Session

**ID**: debug-session
**Symptom**: Dashboard Stats API returns 500/400 due to DB threading exception.
`System.InvalidOperationException: A second operation was started on this context instance before a previous operation completed.`
**File**: `src/backend/Infrastructure/Persistence/Repositories/DashboardRepository.cs`

## Pasos

- [x] PASO 0: Initialize planning files.
- [x] PASO 1: Analyze logs and identify the root cause. (Found EF Core concurrency exception in DashboardRepository due to `Task.WhenAll`).
- [x] PASO 2: Analyze the stack trace (ARQ protocol). The error is exactly at `DashboardRepository.cs:74`. It's a DB threading exception.
- [x] PASO 3: Generate the fix (remove `Task.WhenAll`, await queries sequentially).
- [ ] PASO 4: Update `progress.md` with BUG log.
