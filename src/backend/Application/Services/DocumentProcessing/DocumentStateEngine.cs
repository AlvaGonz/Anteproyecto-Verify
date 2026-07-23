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

            // Populate the Fields dictionary in OcrResult
            foreach (var kvp in normalizedFields)
            {
                ocrResult.Fields[kvp.Key] = new OcrField 
                {
                    Name = kvp.Key,
                    Value = kvp.Value.Value,
                    Confidence = kvp.Value.Confidence,
                    ReviewState = kvp.Value.Presente ? OcrFieldReviewState.Unreviewed : OcrFieldReviewState.Absent
                };
            }

            // Generate Canonical JSON using type-specific mappers
            if (document.TipoDocumento == DocumentType.CertificadoTitulo || document.TipoDocumento == DocumentType.TITLE)
            {
                var extraction = Application.Documents.Extractions.CertificadoTituloRdPaddleMapper.MapFromOcrResult(ocrResult);
                var envelope = new { schemaVersion = "1.0", documentType = "CertificadoTitulo", payload = extraction };
                ocrResult.CanonicalDataJson = JsonSerializer.Serialize(envelope, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            }
            else if (document.TipoDocumento == DocumentType.PlanoMensuraCatastral)
            {
                var extraction = Application.Documents.Extractions.PlanoMensuraCatastralRdPaddleMapper.MapFromOcrResult(ocrResult);
                var envelope = new { schemaVersion = "1.0", documentType = "PlanoMensuraCatastral", payload = extraction };
                ocrResult.CanonicalDataJson = JsonSerializer.Serialize(envelope, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            }
            else if (document.TipoDocumento == DocumentType.ID)
            {
                var extraction = Application.Documents.Extractions.CedulaExtractionMapper.MapFromOcrResult(ocrResult);
                var envelope = new { schemaVersion = "1.0", documentType = "Cedula", payload = extraction };
                ocrResult.CanonicalDataJson = JsonSerializer.Serialize(envelope, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            }

            var options = new JsonSerializerOptions { WriteIndented = false, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var enrichedJson = JsonSerializer.Serialize(ocrResult, options);

            var newStatus = validationResult.EstadoResultante == "Verificado" ? DocumentStatus.Verificado : DocumentStatus.Observado;

            document.SetOcrResult(enrichedJson, newStatus);
        }
        else
        {
            var options = new JsonSerializerOptions { WriteIndented = false, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var errorJson = JsonSerializer.Serialize(ocrResult, options);
            document.SetOcrResult(errorJson, DocumentStatus.Observado);
        }
    }
}
