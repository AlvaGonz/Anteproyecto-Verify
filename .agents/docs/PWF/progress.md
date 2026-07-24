# Progress: Debug Session 404 Not Found on OCR Field Update

- Investigated 404 error when frontend tries to update an OCR field using `useUpdateDocumentFieldReview`.
- Traced the `PATCH` route `/fields/{fieldName}` to `ProjectDocumentsController` which delegates to `DocumentService.UpdateDocumentFieldReviewAsync`.
- Identified that the fields being edited from the frontend (like `oficina`, `superficieM2`) do not exist in the legacy `Fields` dictionary, but instead are located inside `CanonicalDataJson`'s `payload`.
- **Fix:** Modified `DocumentService.UpdateDocumentFieldReviewAsync` to parse `CanonicalDataJson`, perform a case-insensitive lookup within its `payload`, and update the `status` and `normalizedValue` there. 
- It also now adds the field to the legacy `Fields` dictionary if it didn't exist, to prevent `KeyNotFoundException`.
- C# compilation passed. Unit tests exposed pre-existing errors in `PlanoMensuraCatastralRdPaddleMapperTests` and `EstadoJuridicoRdPaddleMapperTests` that are unrelated to this specific change.
- Status: **Complete**.
