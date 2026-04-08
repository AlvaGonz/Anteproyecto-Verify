namespace Application.Contracts.Documents;

using System.Collections.Generic;

public class DocumentValidationResult
{
    public bool IsValid { get; set; }
    public List<string> MissingFields { get; set; } = new();
    public string ValidatedFieldsJson { get; set; } = "{}";
    public bool OcrFailed { get; set; }
}
