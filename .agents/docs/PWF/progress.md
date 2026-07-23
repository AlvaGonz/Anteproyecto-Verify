# Session Progress

## Open Decisions
- None

## Completed Tasks
- Replaced `Task.WhenAll` with sequential `await`s in `DashboardRepository.cs` to fix EF Core concurrency exception.
- Expanded `CertificadoTituloRdPaddleMapper.cs` extraction capabilities:
  - Added extraction for `Matricula` field, including adding it to the `CertificadoTituloRdExtractionV1` DTO.
  - Improved `Municipio` regex to accurately capture multi-word values (e.g. "San Pedro de Macoris") instead of stopping at the first space.
  - Improved `SuperficieM2` regex to handle numbers with internal spaces or apostrophes (e.g., `12, 130.07`) often hallucinated by OCR.
  - Exposed `Matricula` on the React frontend (`types.ts` and `CertificadoTituloExtractionCard.tsx`).
- Validated all fixes using backend Unit Tests and `ocr-real-titulo.spec.ts` Playwright E2E tests against actual PDFs.

## BUG LOG
**BUG-001**: 
- **Symptom**: Dashboard API returns 400/500 errors (`System.InvalidOperationException: A second operation was started on this context instance before a previous operation completed.`).
- **Root Cause**: `DashboardRepository.GetAdminDashboardStatsAsync` was executing multiple EF Core asynchronous queries concurrently via `Task.WhenAll` using the same `DbContext` instance, violating EF Core's non-thread-safe design.
- **Fix**: Removed `Task.WhenAll` and awaited each query sequentially in `DashboardRepository.cs`.
- **Commit**: (Pending commit)
