namespace Application.Services.DocumentProcessing.FieldValidation;

/// <summary>
/// A single field-level rule for OCR validation.
/// Loaded from the static rule table, NOT hardcoded logic.
/// </summary>
public record DocumentFieldRule(
    string Campo,
    string PatronEsperado,   // "text", "date", "alphanumeric-code", "name", "number"
    bool Obligatorio,
    string DocumentoFuente,
    string CriterioAceptacion = "confidence>=0.80"
);
