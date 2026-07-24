namespace Application.Documents.Extractions;

using Application.Abstractions.Ocr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

public static class EstadoJuridicoRdPaddleMapper
{
    public static EstadoJuridicoRdExtractionV1? MapFromOcrResult(OcrResult ocrResult)
    {
        if (ocrResult == null) return null;

        var extraction = new EstadoJuridicoRdExtractionV1
        {
            ExtractionStatus = ocrResult.Success ? ExtractionStatus.Completed : ExtractionStatus.Failed,
            OverallConfidence = ocrResult.Confidence
        };

        var lines = ExtractLines(ocrResult);
        string fullText = string.Join(" ", lines);

        extraction = extraction with 
        {
            Matricula = ExtractField(lines, fullText, "Matricula", 
                new[] { @"MATR[IÍ]CULA" }, 
                new[] { @"(?:MATR[IÍ]CULA(?:\s*No\.?)?|MATR[IÍ]CULA|MATRICULA)\s*([\d-]+)" }),
            
            FechaHoraInscripcion = ExtractField(lines, fullText, "FechaHoraInscripcion", 
                new[] { @"FECHA\s+Y\s+HORA\s+DE\s+INSCRIPCI[OÓ]?N", @"INSCRITO\s+A\s+LAS" }, 
                new[] { @"(?:FECHA Y HORA DE INSCRIPCI[OÓ]?N.*?)([A-Za-z]{3}\s+\d{1,2}\s+\d{4}\s+\d{1,2}:\d{2}[AP]M)" }),
            
            Oficina = ExtractField(lines, fullText, "Oficina", 
                new[] { @"OFICINA" }, 
                new[] { @"(Registro\s*de\s*T[iíIÍ]?tulos\s*(?:de|del)?\s*[\wñÑ\s]{1,30}?)(?:\s*\d|\s*$|\s*Zunda|\s*DESIGNACI[OÓ]N|\s*CERTIFICACION|\s*MATR[IÍ]CULA|12130)", @"(REGISTRO\s+DE\s+T[IÍ]?TULOS\s+(?:DE\s+)?[a-zA-ZñÑ\s]+)" }),
            
            Municipio = ExtractField(lines, fullText, "Municipio", 
                new[] { @"MUNICIPIO" }, 
                new[] { @"MUNICIPIO\s*(?:PODER\s*JUDICIAL\s*:\s*REPUBLICA\s*DOMINICANA\s*)?([a-zA-Z\s]+?)(?=\s*PROVINCIA|\s*OFICINA|\s*SUPERFICIE|$)", @"(?:ubicado en)\s*([a-zA-Z\s]+?)(?:,)", @"(Santo Domingo de Guzm[aá]n|Santo Domingo|Bonao)" }),
            
            Provincia = ExtractField(lines, fullText, "Provincia", 
                new[] { @"PROVINCIA" }, 
                new[] { @"PROVINCIA\s*([a-zA-Z\s]+?)(?=\s*OFICINA|\s*SUPERFICIE|$)", @"PROVINCIA\s*(?:OFICINA\s*)?([a-zA-Z]+)" }),
            
            SuperficieMetrosCuadrados = ExtractField(lines, fullText, "SuperficieM2", 
                new[] { @"SUPERFICIE\s*A\s*REGISTRAR" }, 
                new[] { 
                    @"(?:SUPERFICIE\s*EN\s*METROS\s*CUADRADOS|SUPERFICIE\s*M2|SUPERFICIE\s*A\s*REGISTRAR\s*PARCELA:?|SUPERFICIE)\s*(?:[A-Za-z\s:.,]*?)\s*([\d]+(?:[,.\s\']\d+)*)", 
                    @"([\d]+(?:[,.\s\']\d+)*)\s*(?:m2|m²|m\b|mtros\.cuadrados|metros cuadrados|MTS2)" 
                }),
            
            DesignacionCatastral = ExtractField(lines, fullText, "DesignacionCatastral", 
                new[] { @"DESIGNACI[OÓ]N\s+CATASTRAL", @"PARCELA", @"SOLAR" }, 
                new[] { @"(?:DESIGNACI[OÓ]N\s+CATASTRAL\s*(?:S\s*)?)([\d\-]+)", @"(?:Parce[l]?a\s*(?:dl\s*DoCra\s*Ha\.|del\s*Distrito\s*Catastral\s*No\.)?\s*)([\d\.]+(?:\s+\d+)?)", @"(?:Parce[l]?a\s+)([\d\.]+(?:\s+\d+)?)" }),
            
            DeclaracionEstadoLegal = ExtractField(lines, fullText, "DeclaracionEstadoLegal", 
                new[] { @"CERTIFICACI[OÓ]N\s+DEL\s+ESTADO\s+JUR[IÍ]DICO" }, 
                new[] { @"(El inmueble se encuentra libre de.*?)(?:\.|$)", @"(El inmueble.*?(?:libre|grava).*?)(?:\.|$)" }),

            VieneDe = ExtractField(lines, fullText, "VieneDe", 
                new[] { @"VIENE\s+DE" }, 
                new[] { @"(?:viene de)\s*(?!JURISDICCION\b|MUNICIPIO\b|PROVINCIA\b)([\w\.\-]{2,30})" })
        };

        // Determine if there are active oppositions (inferred from DeclaracionEstadoLegal)
        bool hasActiveOppositions = true;
        if (!string.IsNullOrWhiteSpace(extraction.DeclaracionEstadoLegal.RawValue))
        {
            var rawLower = extraction.DeclaracionEstadoLegal.RawValue.ToLower();
            if (rawLower.Contains("libre de derechos") || rawLower.Contains("libre de cargas") || rawLower.Contains("sin gravamen"))
            {
                hasActiveOppositions = false;
            }
        }

        extraction = extraction with { HasActiveOppositions = hasActiveOppositions };

        // Extraction Status Classification
        var warnings = new List<string>();

        if (extraction.Matricula.Status == FieldStatus.Missing)
        {
            extraction = extraction with { ExtractionStatus = ExtractionStatus.Incomplete };
        }

        if (fullText.Contains("VIENE DE") || fullText.Contains("Viene de"))
        {
            if (extraction.VieneDe.Status == FieldStatus.Missing)
            {
                warnings.Add("El campo VieneDe fue detectado pero no contiene valor");
            }
        }

        if (warnings.Any())
        {
            extraction = extraction with { Warnings = warnings };
        }

        return extraction;
    }

    private static List<string> ExtractLines(OcrResult ocrResult)
    {
        var lines = new List<string>();
        if (!string.IsNullOrWhiteSpace(ocrResult.RawJson) && ocrResult.RawJson.Contains("('"))
        {
            var matches = Regex.Matches(ocrResult.RawJson.Replace("\\\"", "\""), @"\('(.*?)',\s*(\d+\.\d+)");
            foreach (Match m in matches)
            {
                lines.Add(m.Groups[1].Value);
            }
        }
        else if (ocrResult.Lines != null && ocrResult.Lines.Any())
        {
            lines.AddRange(ocrResult.Lines.Select(l => l.Text));
        }
        else if (!string.IsNullOrWhiteSpace(ocrResult.ExtractedText))
        {
            lines.AddRange(ocrResult.ExtractedText.Split(new[] { '\n', '\r' }, System.StringSplitOptions.RemoveEmptyEntries));
        }
        return lines;
    }

    private static ExtractedField ExtractField(List<string> lines, string fullText, string fieldType, string[] labelPatterns, string[] regexPatterns)
    {
        string? rawValue = null;

        // Layer 1 & 2: Labeled field extraction + proximity
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i];
            foreach (var labelPattern in labelPatterns)
            {
                if (Regex.IsMatch(line, labelPattern, RegexOptions.IgnoreCase))
                {
                    // Check if value is on the same line after the label
                    var inlineMatch = Regex.Match(line, $@"{labelPattern}\s*[:\-]?\s*(.+)", RegexOptions.IgnoreCase);
                    if (inlineMatch.Success && !string.IsNullOrWhiteSpace(inlineMatch.Groups[1].Value))
                    {
                        rawValue = inlineMatch.Groups[1].Value;
                        break;
                    }
                    
                    // Check next line for proximity block
                    if (i + 1 < lines.Count && !Regex.IsMatch(lines[i + 1], @"^[A-Z\s:.,]+$")) // If next line is not another all-caps label
                    {
                        rawValue = lines[i + 1];
                        break;
                    }
                }
            }
            if (rawValue != null) break;
        }

        // Layer 3: Regex fallback
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            foreach (var p in regexPatterns)
            {
                var match = Regex.Match(fullText, p, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    rawValue = match.Groups.Count > 1 ? match.Groups[1].Value : match.Value;
                    break;
                }
            }
        }

        // Layer 4: Canonical Normalization
        if (!string.IsNullOrWhiteSpace(rawValue))
        {
            rawValue = rawValue.Trim().TrimEnd('.');
            string normalizedValue = rawValue;
            
            switch (fieldType)
            {
                case "Matricula":
                    normalizedValue = SharedFieldNormalizer.NormalizeMatricula(rawValue);
                    break;
                case "DesignacionCatastral":
                    normalizedValue = SharedFieldNormalizer.NormalizeDesignacionCatastral(rawValue);
                    break;
                case "SuperficieM2":
                    normalizedValue = SharedFieldNormalizer.NormalizeSuperficie(rawValue);
                    break;
                case "FechaHoraInscripcion":
                    if (DateTime.TryParse(rawValue, out var parsedDate))
                    {
                        normalizedValue = parsedDate.ToString("yyyy-MM-ddTHH:mm:ss");
                    }
                    else
                    {
                        // Custom parsing for "Oct 1 2024 3:32PM"
                        if (DateTime.TryParseExact(rawValue, "MMM d yyyy h:mmtt", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var exactDate))
                        {
                            normalizedValue = exactDate.ToString("yyyy-MM-ddTHH:mm:ss");
                        }
                    }
                    break;
            }

            return new ExtractedField
            {
                RawValue = rawValue,
                NormalizedValue = normalizedValue,
                Confidence = 0.8,
                Status = FieldStatus.Valid,
                SourcePage = 1
            };
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }
}
