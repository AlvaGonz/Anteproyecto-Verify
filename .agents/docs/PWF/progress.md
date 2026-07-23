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
- Re-architected Playwright E2E tests for `CertificadoTitulo` extraction (`ocr-real-titulo.spec.ts`).
  - Replaced the dependency on local OneDrive PDF files with a pure UI smoke test.
  - Tested UI handling of missing/incomplete extraction data by uploading a dummy PDF and waiting for the validation panel.
  - Fixed Playwright ES module `__dirname` resolution by utilizing `process.cwd()`.
- Validated all fixes using backend Unit Tests and `ocr-real-titulo.spec.ts` Playwright E2E tests against actual PDFs.
- Expanded `PlanoMensuraCatastralRdPaddleMapper.cs` extraction capabilities:
  - Reworked `MapFromOcrResult` to use a layered heuristics approach combining labeled extraction and direct regex matching.
  - Handled label-as-value scenarios (e.g. `TipoPlano`).
  - Improved `DesignacionCatastralOrigen` regex to handle "TEMPORAL" modifier.
  - Implemented `NormalizeEscala` and `NormalizeOperacion` in `SharedFieldNormalizer.cs` to handle fractional scale spacing and OCR spelling mistakes for "SUBDIVISION".
  - Enforced `ExtractionStatus.Incomplete` if any critical field (`DesignacionCatastralPosicional`, `Provincia`, `Municipio`, `SuperficieARegistrarParcelaM2`) is missing, as per user's instruction.
- Added comprehensive unit tests in `PlanoMensuraCatastralRdPaddleMapperTests.cs` using synthetic `OcrLine` data mimicking PaddleOCR output.
## BUG LOG
**BUG-001**: 
- **Symptom**: Dashboard API returns 400/500 errors (`System.InvalidOperationException: A second operation was started on this context instance before a previous operation completed.`).
- **Root Cause**: `DashboardRepository.GetAdminDashboardStatsAsync` was executing multiple EF Core asynchronous queries concurrently via `Task.WhenAll` using the same `DbContext` instance, violating EF Core's non-thread-safe design.
- **Fix**: Removed `Task.WhenAll` and awaited each query sequentially in `DashboardRepository.cs`.
- **Commit**: (Pending commit)
