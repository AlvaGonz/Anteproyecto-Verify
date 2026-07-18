namespace Application.Services.DocumentProcessing;

using Application.Abstractions.Ocr;
using Application.Services.DocumentProcessing.FieldValidation;
using Domain.Entities;
using Domain.Enums;
using System;
using System.Text.Json;

public interface IDocumentStateEngine
{
    void ApplyOcrResult(Documento document, OcrResult ocrResult);
}

public class DocumentStateEngine : IDocumentStateEngine
{
    private readonly IDocumentFieldNormalizer _normalizer;
    private readonly IDocumentValidationRuleEngine _ruleEngine;

    public DocumentStateEngine(IDocumentFieldNormalizer normalizer, IDocumentValidationRuleEngine ruleEngine)
    {
        _normalizer = normalizer;
        _ruleEngine = ruleEngine;
    }

    public void ApplyOcrResult(Documento document, OcrResult ocrResult)
    {
        if (document.EstadoDocumento != DocumentStatus.Processing && document.EstadoDocumento != DocumentStatus.Uploaded)
        {
            throw new InvalidOperationException($"Cannot apply OCR result to document in state {document.EstadoDocumento}");
        }

        if (ocrResult.Success)
        {
            var rules = DocumentFieldRuleTable.GetRulesForDocumentType(document.TipoDocumento);
            var allRules = new System.Collections.Generic.List<DocumentFieldRule>(rules);
            allRules.AddRange(DocumentFieldRuleTable.CrossCuttingRules);
            
            var normalizedFields = _normalizer.Normalize(ocrResult, document.TipoDocumento);
            var validationResult = _ruleEngine.Validate(normalizedFields, allRules);

            // Merge the field validation result into the stored JSON
            var options = new JsonSerializerOptions { WriteIndented = false };
            
            // As decided in the plan, we enrich the OCR JSON instead of a new DB column
            var enrichedJson = JsonSerializer.Serialize(new {
                RawOcr = ocrResult.RawJson,
                FieldValidation = validationResult,
                NormalizedFields = normalizedFields
            }, options);

            var newStatus = validationResult.EstadoResultante == "Verificado" ? DocumentStatus.Verificado : DocumentStatus.Observado;

            document.SetOcrResult(enrichedJson, newStatus);
        }
        else
        {
            document.SetOcrResult(ocrResult.RawJson, DocumentStatus.Observado);
        }
    }
}
