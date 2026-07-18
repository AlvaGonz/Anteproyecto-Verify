namespace Application.Services.DocumentProcessing.FieldValidation;

using System.Collections.Generic;

/// <summary>
/// Evaluates extracted fields against the rule table and produces a validation result.
/// </summary>
public interface IDocumentValidationRuleEngine
{
    DocumentFieldValidationResult Validate(
        Dictionary<string, ExtractedField> fields,
        IReadOnlyList<DocumentFieldRule> rules,
        double globalConfidenceThreshold = 0.80);
}
