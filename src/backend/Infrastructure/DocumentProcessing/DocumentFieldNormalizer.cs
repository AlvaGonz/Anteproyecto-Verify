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
            fields["firstNames"] = TryExtractFirstNames(text);
            fields["lastNames"] = TryExtractLastNames(text);
            fields["birthDate"] = TryExtractBirthDate(text);
            fields["expiryDate"] = TryExtractExpiryDate(text);
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

    public ExtractedField TryExtractFirstNames(string text)
    {
        var match = Regex.Match(text, @"(?:Nombre|NOMBRES)\s+([\w\sÁÉÍÓÚÑáéíóúñ]+?)\s+(?:Apellido|APELLIDOS)", RegexOptions.IgnoreCase);
        if (match.Success)
        {
            return new ExtractedField(NormalizePersonName(match.Groups[1].Value), 0.90, true);
        }
        return new ExtractedField(string.Empty, 0.0, false);
    }

    public ExtractedField TryExtractLastNames(string text)
    {
        var match = Regex.Match(text, @"(?:Apellido|APELLIDOS)\s+([\w\sÁÉÍÓÚÑáéíóúñ]+?)\s+(?:Nacionalidad|Lugar|Estado)", RegexOptions.IgnoreCase);
        if (match.Success)
        {
            return new ExtractedField(NormalizePersonName(match.Groups[1].Value), 0.90, true);
        }
        return new ExtractedField(string.Empty, 0.0, false);
    }

    public ExtractedField TryExtractBirthDate(string text)
    {
        var match = Regex.Match(text, @"(?:Fecha de nacimiento|FECHA DE NACIMIENTO).*?(\d{2}\s*[A-Z]+\s*\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{4})", RegexOptions.IgnoreCase);
        if (match.Success)
        {
            var normalized = NormalizeDominicanDate(match.Groups[1].Value);
            if (!string.IsNullOrEmpty(normalized))
                return new ExtractedField(normalized, 0.90, true);
        }
        return new ExtractedField(string.Empty, 0.0, false);
    }

    public ExtractedField TryExtractExpiryDate(string text)
    {
        var match = Regex.Match(text, @"(?:Vigencia hasta|FECHA DE EXPIRACION)\s*(\d{2}\s*[A-Z]+\s*\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{4})", RegexOptions.IgnoreCase);
        if (match.Success)
        {
            var normalized = NormalizeDominicanDate(match.Groups[1].Value);
            if (!string.IsNullOrEmpty(normalized))
                return new ExtractedField(normalized, 0.90, true);
        }
        return new ExtractedField(string.Empty, 0.0, false);
    }

    private string NormalizePersonName(string raw)
    {
        var upper = raw.ToUpperInvariant().Normalize(System.Text.NormalizationForm.FormC);
        return Regex.Match(upper, @"[A-ZÑÁÉÍÓÚ\s]+").Value.Trim();
    }

    private string NormalizeDominicanDate(string raw)
    {
        var clean = raw.Replace("-", "/").Replace(" ", "").ToUpperInvariant();
        
        var months = new[] { "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE" };
        for (int i = 0; i < months.Length; i++)
        {
            if (clean.Contains(months[i]))
            {
                clean = clean.Replace(months[i], $"/{i + 1:D2}/");
                break;
            }
        }

        if (DateTime.TryParseExact(clean, new[] { "dd/MM/yyyy", "d/M/yyyy", "dd/M/yyyy", "d/MM/yyyy" }, 
            System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var dt))
        {
            return dt.ToString("yyyy-MM-dd");
        }
        return string.Empty;
    }

    public string NormalizeDateTimeIso8601(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        
        // Attempt to parse standard datetime
        if (DateTime.TryParse(raw, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.RoundtripKind, out var dt))
        {
            // Check if offset was provided in the raw string (Z or +/-00:00)
            bool hasOffset = raw.EndsWith("Z", StringComparison.OrdinalIgnoreCase) || Regex.IsMatch(raw, @"[+-]\d{2}:\d{2}$");
            bool hasTime = raw.Contains("T") || raw.Contains(":") || Regex.IsMatch(raw, @"\d{1,2}:\d{2}");

            if (hasOffset)
            {
                return dt.ToString("yyyy-MM-ddTHH:mm:ssK");
            }
            else if (hasTime)
            {
                return dt.ToString("yyyy-MM-ddTHH:mm:ss");
            }
            else
            {
                return dt.ToString("yyyy-MM-dd");
            }
        }
        
        // Fallback for custom Dominican string formats without time
        return NormalizeDominicanDate(raw);
    }

    public string NormalizeAreaM2(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        
        // Extract numbers and decimal point, handling commas/periods correctly depending on context
        // Typically in DR: 1,200.50 (comma for thousands, dot for decimals)
        var match = Regex.Match(raw.Replace(",", ""), @"\d+(\.\d+)?");
        if (match.Success)
        {
            if (decimal.TryParse(match.Value, System.Globalization.CultureInfo.InvariantCulture, out var area))
            {
                return area.ToString(System.Globalization.CultureInfo.InvariantCulture);
            }
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
