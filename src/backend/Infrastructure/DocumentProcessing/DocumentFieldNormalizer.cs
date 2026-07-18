namespace Infrastructure.DocumentProcessing;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Application.Abstractions.Ocr;
using Application.Services.DocumentProcessing.FieldValidation;
using Domain.Enums;

/// <summary>
/// Normalizes raw OCR results into a typed field bag based on the expected rules for the document type.
/// Uses heuristics to extract fields since the current OCR provider only returns raw text.
/// </summary>
public class DocumentFieldNormalizer : IDocumentFieldNormalizer
{
    public Dictionary<string, ExtractedField> Normalize(OcrResult ocrResult, DocumentType documentType)
    {
        var fields = new Dictionary<string, ExtractedField>();
        var rules = DocumentFieldRuleTable.GetRulesForDocumentType(documentType);
        
        if (ocrResult == null || string.IsNullOrWhiteSpace(ocrResult.ExtractedText))
        {
            return fields;
        }

        var text = ocrResult.ExtractedText;

        // In a real structured OCR, we would just map ocrResult.Fields.
        // Since we only have raw text, we apply basic regex/heuristics to detect presence.
        
        foreach (var rule in rules)
        {
            var (value, confidence, present) = ExtractFieldWithHeuristics(text, rule.Campo, rule.PatronEsperado);
            fields[rule.Campo] = new ExtractedField(value, confidence, present);
        }

        // Apply cross-cutting rules
        foreach (var rule in DocumentFieldRuleTable.CrossCuttingRules)
        {
            // Stub alerts to NotImplementedYet as requested
            if (rule.Campo == "alertas_enmienda_tachadura_alteracion")
            {
                fields[rule.Campo] = new ExtractedField("NotImplementedYet", 1.0, false);
                continue;
            }

            var (value, confidence, present) = ExtractFieldWithHeuristics(text, rule.Campo, rule.PatronEsperado);
            fields[rule.Campo] = new ExtractedField(value, confidence, present);
        }

        return fields;
    }

    private (string Value, double Confidence, bool Present) ExtractFieldWithHeuristics(string fullText, string fieldName, string expectedPattern)
    {
        // This is a naive implementation simulating extraction from raw text.
        // A true implementation would use NLP or layout-aware parsing.
        
        // Convert to lowercase for easier matching
        var normalizedText = fullText.ToLowerInvariant();
        
        // Very basic keyword presence check based on field name
        var keyword = fieldName.Replace("_", " ").ToLowerInvariant();
        
        // Some specific overrides for common legal terms
        keyword = fieldName switch
        {
            "matricula_serial" => "matrícula",
            "titular" => "propietario",
            "fecha_nacimiento" => "fecha de nacimiento",
            "descripcion_inmueble" => "inmueble",
            _ => keyword
        };

        bool isPresent = normalizedText.Contains(keyword) || 
                        (expectedPattern == "date" && Regex.IsMatch(fullText, @"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"));

        if (isPresent)
        {
            // Simulate extracting a value (just return the keyword as a placeholder for now)
            // and a mock confidence score.
            return (keyword, 0.85, true);
        }

        return (string.Empty, 0.0, false);
    }
}
