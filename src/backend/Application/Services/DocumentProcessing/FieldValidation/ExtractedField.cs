namespace Application.Services.DocumentProcessing.FieldValidation;

/// <summary>
/// A single field extracted and normalized from OCR output.
/// </summary>
public record ExtractedField(string Value, double Confidence, bool Presente);
