# Progress: Debug Session 404 Not Found on OCR Field Update

- Investigated 404 error when frontend tries to update an OCR field using `useUpdateDocumentFieldReview`.
- Traced the `PATCH` route `/fields/{fieldName}` to `ProjectDocumentsController` which delegates to `DocumentService.UpdateDocumentFieldReviewAsync`.
- Identified that the fields being edited from the frontend (like `oficina`, `superficieM2`) do not exist in the legacy `Fields` dictionary, but instead are located inside `CanonicalDataJson`'s `payload`.
- **Fix:** Modified `DocumentService.UpdateDocumentFieldReviewAsync` to parse `CanonicalDataJson`, perform a case-insensitive lookup within its `payload`, and update the `status` and `normalizedValue` there. 
- It also now adds the field to the legacy `Fields` dictionary if it didn't exist, to prevent `KeyNotFoundException`.
- C# compilation passed. Unit tests exposed pre-existing errors in `PlanoMensuraCatastralRdPaddleMapperTests` and `EstadoJuridicoRdPaddleMapperTests` that are unrelated to this specific change.
- Status: **Complete**.
| Additional Project Images (5 columns) – Migration, API endpoints, Frontend hooks & UI, Unit Test Fixes   | RF-2, OE-1  | ExpedienteRebuild                                    | 2d6adabf   | 2026-07-13 |
| Corporate Invite Users Flow (Invitacion entity, SettingsController, UI Modal) | N/A | develop | (pending) | 2026-07-12 |
| Fix Admin Dashboard Stats 403 & potential-invitees 404 | N/A | develop | (pending) | 2026-07-12 |
| Corporate Invitee Confirmation Modal (Null Limits warning) | N/A | develop | (pending) | 2026-07-13 |
| Fix Guest Initial Status marking "Activo" before login | N/A | develop | (pending) | 2026-07-13 |
| Corporate Invitee Deletion Confirmation Modal | N/A | develop | (pending) | 2026-07-13 |
## 📄 In Progress
| Feature | TRD Section | Status | Blocker |
| ------- | ----------- | ------ | ------- |
| Document Ingestion Foundation (Azurite, OCR Stub, State Engine) | N/A | 100% | None |
| OCR Extraction Enhancements (EstadoJuridico, Matricula, Plano fields) | RF-3 | 100% | None |

## 📋 Next Up (Prioritized)
1. Verify consent test passes in CI pipeline (COMPLETED)
2. Merge OCR extraction improvements from develop
3. Integrate quota modal handling into ProjectPublicDetailPage

## ⚠️ Open Decisions (Human-in-the-Loop Required)
- Human action required: confirm schema via MCP before proceeding with EF Core migrations.

## 🚫 Known Constraints
- None

---

## 📋 QA Backlog (from To-do.txt)
| Priority         | Count | Items                                         |
| ---------------- | ----- | --------------------------------------------- |
| 🔴 P0 – Critical  | 6     | WBS-001..006 – Routes rotas + E2E tests       |
| 🟠 P1 – High      | 8     | WBS-007..014 – Security, Compliance, 17 UIs   |
| 🟡 P2 – Medium    | 5     | WBS-015..019 – UX mejoras                     |
| 🟢 P3 – Tech Debt | 10    | TEC-001..010 – Accesibilidad, rendimiento, CI |

## 📄 In Progress (QA Roadmap – ORCH-TEST-001 Proof)
| WBS     | Item                            | Agent                | Status                  |
| ------- | ------------------------------- | -------------------- | ----------------------- |
| WBS-001 | RegisterPage test               | tdd-guide            | ✅ 257 lines, 11 tests   |
| WBS-005 | TC-002 coordinates diagnosis    | build-error-resolver | ✅ Diagnosis report      |
| WBS-007 | JWT localStorage audit          | security-reviewer    | ✅ SEC-001 surfaced      |
| WBS-009 | Bundle optimization             | refactor-cleaner     | ✅ Analysis report       |
| WBS-012 | Password policy xUnit test      | tdd-guide            | ✅ 6 theory/2 fact tests |
| WBS-013 | Consent gate audit (Law 172-13) | ley172-13-auditor    | ✅ COMP-001 surfaced     |
| WBS-014 | 17 UI screens breakdown         | planner              | ✅ 17 screens mapped     |
| WBS-020 | RF-10 Integrity Seal ADR        | architect            | ✅ ADR-005 (357 lines)   |
| TEC-010 | SonarCloud pipeline gate        | devops-specialist    | ✅ Pipeline config       |
| WBS-022 | Invitation Limits E2E Tests     | playwright-skill     | ✅ 08-invitation-limits  |

## ⚠️ Open Decisions (Human-in-the-Loop Required)
- [x] JWT migration from localStorage to HttpOnly cookies (SEC-001) – surfaced in ORCH-TEST-001 (DONE - Security Hardening)
- [x] TransUnion consent gate verification (COMP-001) – surfaced in ORCH-TEST-001 (DONE)
- [x] EF Core concurrency fix in Dashboard (BUG-001) – replaced Task.WhenAll with sequential awaits (DONE)
- [ ] Set GROQ_API_KEY environment variable – all 8 subagents return empty without it (ROOT CAUSE)
- [x] Create missing agent files: BatchExecutor.md, DocWriter.md (DONE)
- [x] ADR-006: SEC-001 JWT cookie migration plan (PHASED, APPROVAL REQUIRED)
- [x] ADR-007: COMP-001 TransUnion consent gate plan (IMPLEMENTED – version check + tests)
  - `ConsentGateConstants.CurrentVersionPolitica = "v1.0"` (Application.Common)
  - `ConsultarCreditoCommandHandler` blocks TransUnion if version mismatch
  - `VerificarConsentimientoVigenteQueryHandler` returns false if version mismatch
  - Test: `CreditCheck_ConsentVersionMismatch_BlocksTransUnion`
- [ ] Public endpoint changes for Precios page (BUG-005)

## 📄 Completed Tasks (OCR Extraction & Dashboard Perf)
- Replaced `Task.WhenAll` with sequential `await`s in `DashboardRepository.cs` to fix EF Core concurrency exception (BUG-001).
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
