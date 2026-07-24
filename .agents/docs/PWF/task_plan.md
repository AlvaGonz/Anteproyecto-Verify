# Debug Session: 404 Not Found on PATCH /fields/{fieldName}

## Symptom
`PATCH http://localhost:5000/api/projects/ecc3f121-f494-d477-6ce5-00069f8a27ab/documents/69173d16-d1c5-4966-82e2-52963c591cb0/fields/superficieM2` returned `404 (Not Found)`.

## Root Cause
The backend parses the OCR JSON string into an `OcrResult` with a `Dictionary<string, OcrField> Fields`. Since it's deserialized by `System.Text.Json`, the dictionary keys keep the exact casing from the JSON (often PascalCase like `SuperficieM2`). The frontend passes `superficieM2` (camelCase).
In `DocumentService.cs` line ~363, the code was doing a case-sensitive check:
`if (!ocrResult.Fields.ContainsKey(fieldName))`
which threw a `KeyNotFoundException`, returning a 404 to the frontend.

## Fix
Changed the exact match lookup in `UpdateDocumentFieldReviewAsync` inside `DocumentService.cs` to use `FirstOrDefault(k => string.Equals(k, fieldName, StringComparison.OrdinalIgnoreCase))` to be resilient to casing differences between frontend and backend.

## Status
- [x] Analyze stack trace / behavior
- [x] Fix applied to `DocumentService.cs`
- [x] Tests run (`dotnet test` returned compilation errors in unrelated pre-existing tests).
- [ ] Record in PWF progress (pending)
