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

        if (documentType == DocumentType.ID)
        {
            fields["cedulaNumber"] = TryExtractCedulaNumber(text);
            fields["firstNames"] = TryExtractLabeledName(text, "NOMBRES");
            fields["lastNames"] = TryExtractLabeledName(text, "APELLIDOS");
            fields["birthDate"] = TryExtractLabeledDate(text, "FECHA DE NACIMIENTO");
            fields["expiryDate"] = TryExtractLabeledDate(text, "FECHA DE EXPIRACION");
        }
        else
        {
            foreach (var rule in rules)
            {
                var (value, confidence, present) = ExtractFieldWithHeuristics(text, rule.Campo, rule.PatronEsperado);
                fields[rule.Campo] = new ExtractedField(value, confidence, present);
            }
        }

        // Apply cross-cutting rules
        foreach (var rule in DocumentFieldRuleTable.CrossCuttingRules)
        {
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

    public ExtractedField TryExtractCedulaNumber(string text)
    {
        var match = Regex.Match(text, @"\b\d{3}-?\d{7}-?\d{1}\b");
        if (match.Success)
        {
            var raw = match.Value;
            var normalized = raw.Replace("-", "").PadLeft(11, '0');
            return new ExtractedField(normalized, 0.95, true);
        }
        return new ExtractedField(string.Empty, 0.0, false);
    }

    public ExtractedField TryExtractLabeledName(string text, string label)
    {
        var match = Regex.Match(text, $@"{label}\s*[\r\n]+([A-ZÑÁÉÍÓÚ\s]+)", RegexOptions.IgnoreCase);
        if (match.Success && match.Groups.Count > 1)
        {
            var raw = match.Groups[1].Value.Trim();
            var normalized = NormalizePersonName(raw);
            return new ExtractedField(normalized, 0.90, true);
        }
        return new ExtractedField(string.Empty, 0.0, false);
    }

    public ExtractedField TryExtractLabeledDate(string text, string label)
    {
        var match = Regex.Match(text, $@"{label}[^\d]*(\d{{1,2}}[/-]\d{{1,2}}[/-]\d{{4}})", RegexOptions.IgnoreCase);
        if (match.Success && match.Groups.Count > 1)
        {
            var raw = match.Groups[1].Value.Trim();
            var normalized = NormalizeDominicanDate(raw);
            if (!string.IsNullOrEmpty(normalized))
            {
                return new ExtractedField(normalized, 0.90, true);
            }
        }
        return new ExtractedField(string.Empty, 0.0, false);
    }

    private string NormalizePersonName(string raw)
    {
        var upper = raw.ToUpperInvariant().Normalize(System.Text.NormalizationForm.FormC);
        return Regex.Replace(upper, @"\s+", " ").Trim();
    }

    private string NormalizeDominicanDate(string raw)
    {
        var clean = raw.Replace("-", "/");
        if (DateTime.TryParseExact(clean, new[] { "dd/MM/yyyy", "d/M/yyyy", "dd/M/yyyy", "d/MM/yyyy" }, 
            System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var dt))
        {
            return dt.ToString("yyyy-MM-dd");
        }
        return string.Empty;
    }

    private (string Value, double Confidence, bool Present) ExtractFieldWithHeuristics(string fullText, string fieldName, string expectedPattern)
    {
        var normalizedText = fullText.ToLowerInvariant();
        var keyword = fieldName.Replace("_", " ").ToLowerInvariant();
        
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
            return (keyword, 0.85, true);
        }

        return (string.Empty, 0.0, false);
    }
}
