# Session Progress

## Open Decisions
- None

## Completed Tasks
- Replaced `Task.WhenAll` with sequential `await`s in `DashboardRepository.cs` to fix EF Core concurrency exception.

## BUG LOG
**BUG-001**: 
- **Symptom**: Dashboard API returns 400/500 errors (`System.InvalidOperationException: A second operation was started on this context instance before a previous operation completed.`).
- **Root Cause**: `DashboardRepository.GetAdminDashboardStatsAsync` was executing multiple EF Core asynchronous queries concurrently via `Task.WhenAll` using the same `DbContext` instance, violating EF Core's non-thread-safe design.
- **Fix**: Removed `Task.WhenAll` and awaited each query sequentially in `DashboardRepository.cs`.
- **Commit**: (Pending commit)
