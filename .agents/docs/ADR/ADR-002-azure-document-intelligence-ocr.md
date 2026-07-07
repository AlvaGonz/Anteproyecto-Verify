# ADR-002: Azure AI Document Intelligence as Mandatory OCR Provider (RF-3)

**Date:** 2026-05-25
**Status:** Accepted
**Supersedes:** N/A
**Referenced in:** `TRD_VeriFinca.md §4` · `ARCHITECTURE.md §4`

---

## Context

RF-3 requires automated extraction of structured fields from uploaded legal documents (property titles, cadastral plans, DGII certificates, construction permits, financial statements). These documents are scanned PDFs and photographs with variable layout, handwritten signatures, and official stamps.

Three options were evaluated:

| Option | Reason Rejected / Accepted |
|---|---|
| **Tesseract OCR (open source)** | Rejected. Requires custom training infrastructure, no pre-built models for Dominican legal document layouts, poor performance on low-resolution scans, zero managed SLA |
| **Google Cloud Document AI** | Rejected. Adds a non-Azure vendor dependency, complicates Managed Identity auth model, increases data residency complexity for Law 172-13 compliance (data must remain in DR/US Azure regions) |
| **Azure AI Document Intelligence** | **Accepted.** Native Azure integration via Managed Identity (no static API keys in code), pre-built `prebuilt-document` model as safe fallback, custom model training available in Azure AI Studio for DR-specific document types, 99.9% SLA, SOC 2 Type II compliance |

---

## Decision

**Azure AI Document Intelligence** (SDK: `Azure.AI.FormRecognizer` v4+ via `Azure.AI.DocumentAnalysis`) is the sole OCR provider for RF-3.

Authentication: Managed Identity → Key Vault secret `verifinca-docai-key`.
Primary call: `AnalyzeDocumentAsync(modelId, blobUrl)` using custom-trained model per document type.
Fallback: `prebuilt-document` model when custom model is unavailable or returns `Confidence < 0.50` on critical fields.
Rejection threshold: Any extracted field with `Confidence < 0.85` is treated as absent and triggers an alert code (`DOC_INVALID_SIGNATURE`, `DOC_INCOMPLETE_FIELDS`).

Raw OCR output is persisted immutably in `Documents.OcrResultJson`. No post-hoc modification of OCR results is permitted.

---

## Consequences

**Positive:**
- Zero infrastructure to maintain for OCR model serving
- Custom model training pipeline available in Azure AI Studio as project matures
- `Confidence` scores provide a deterministic, auditable rejection threshold
- Data stays within Azure (East US 2) — satisfies Law 172-13 data residency requirement
- Managed Identity auth eliminates static key rotation burden

**Negative:**
- Custom model training requires labeled document samples (minimum 5 per document type, recommended 50+) — a human-labeling effort required before production launch of custom models
- `prebuilt-document` fallback may miss domain-specific fields (e.g., Dominican notary seals) — Phase 1 MVP accepts this limitation

**Risks:**
- **Custom model unavailability:** Mitigated by `prebuilt-document` fallback. Any fallback usage emits `Warning` log and custom Application Insights event.
- **Confidence threshold too strict (false negatives):** Threshold of `0.85` is configurable via `appsettings.json` under `OcrOptions:ConfidenceThreshold`. Adjust based on observed false negative rate after first 100 production documents.
