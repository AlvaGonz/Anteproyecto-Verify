using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Application.Abstractions.Ocr;

namespace Application.Documents.Extractions
{
    public static class PlanoMensuraCatastralRdPaddleMapper
    {
        public static PlanoMensuraCatastralRdExtractionV1? MapFromOcrResult(OcrResult ocrResult)
        {
            if (ocrResult == null) return null;

            var extraction = new PlanoMensuraCatastralRdExtractionV1
            {
                ExtractionStatus = ocrResult.Success ? ExtractionStatus.Completed : ExtractionStatus.Failed,
                OverallConfidence = ocrResult.Confidence
            };

            var lines = ExtractLines(ocrResult);
            string fullText = string.Join(" ", lines);

            extraction = extraction with
            {
                Departamento = ExtractField(lines, fullText, "Departamento",
                    new[] { @"DEPARTAMENTO" },
                    new[] { @"DEPARTAMENTO\s*([a-zA-Z]+)", @"DEPARTAMENTO\s*([a-zA-Z]+)\b", @"(ESTE|NORTE|SUR|OESTE|CENTRAL)" }),

                Operacion = ExtractField(lines, fullText, "Operacion",
                    new[] { @"OPERACION", @"OPERACIOSUBDISION", @"OPEACIONSUBDIVISIN" },
                    new[] { @"OPERACION[A-Z\s:]*([A-Za-z]+)", @"(SUBDIVISION|PLANO CATASTRAL|SANEAMIENTO|DESLINDE|REFUNDICION)" }),

                DesignacionCatastralPosicional = ExtractField(lines, fullText, "DesignacionCatastralPosicional",
                    new[] { @"DESIGNACION CATASTRAL POSICIONAL", @"DESIGNACION TEMPORA" },
                    new[] { @"DESIGNACION CATASTRAL POSICIONAL:?\s*(?:CATASTRAL DE ORIGEN CALLE\s*|DESIGNACION TEMPORA(?:L)?\s*)?([\d_]+)", @"(420[\d_]+)" }),

                DesignacionCatastralOrigen = ExtractField(lines, fullText, "DesignacionCatastralOrigen",
                    new[] { @"CATASTRAL DE ORIGEN(?: TEMPORAL)?", @"TEMPORAL:" },
                    new[] { @"(?:CATASTRAL DE ORIGEN(?: TEMPORAL)?:?|TEMPORAL:)\s*([\d_]+)", @"(420[\d_]+)" }),

                Provincia = ExtractField(lines, fullText, "Provincia",
                    new[] { @"PROVINCIA" },
                    new[] { @"PROVINCIA\s*([a-zA-Z\s]+?)(?=\s*MUNICIPIO|\s*SECCION|\s*LUGAR|\s*SUPERFICIE|$)", @"(?:PROVINCIA\s*)([A-Z\s]{4,})" }),

                Municipio = ExtractField(lines, fullText, "Municipio",
                    new[] { @"MUNICIPIO", @"IUNICIPIO" },
                    new[] { @"MUNICIPIO:?\s*([a-zA-Z\s]+?)(?=\s*SECCION|\s*LUGAR|\s*PROVINCIA|\s*SUPERFICIE|$)", @"(?:MUNICIPIO\s*)([A-Z\s]{4,})" }),

                Seccion = ExtractField(lines, fullText, "Seccion",
                    new[] { @"SECCI[OÓ]N", @"SECCI" },
                    new[] { @"SECCI[OÓ]N:?\s*([a-zA-Z\s]+?)(?=\s*LUGAR|\s*PROVINCIA|\s*MUNICIPIO|\s*SUPERFICIE|$)", @"(?:SECCI[OÓ]N\s*)([A-Z\s]{4,})" }),

                Lugar = ExtractField(lines, fullText, "Lugar",
                    new[] { @"LUGAR", @"LUGARTDC" },
                    new[] { @"LUGAR:?\s*([a-zA-Z\s]+?)(?=\s*PROVINCIA|\s*MUNICIPIO|\s*SECCION|\s*SUPERFICIE|$)", @"(?:LUGAR\s*)([A-Z\s]{4,})" }),

                SuperficieARegistrarParcelaM2 = ExtractField(lines, fullText, "SuperficieM2",
                    new[] { @"SUPERFICIE\s*A\s*REGISTRAR", @"FICIEAREGISTRAR" },
                    new[] { @"(?:SUPERFICIE A REGISTRAR|FICIEAREGISTRAR) PARCELA\s*([\d,.]+)", @"([\d,.]+)\s*m2", @"([\d,.]+)\s*m\b" }),

                Escala = ExtractField(lines, fullText, "Escala",
                    new[] { @"ESCALA" },
                    new[] { @"ESCALA\s*([\d:\s]+)", @"ESCALA\s*(1\s*:\s*\d+)" })
            };

            var warnings = new List<string>();

            // Critical fields check based on user feedback "If critical yes"
            // Critical fields for Plano de Mensura:
            if (extraction.DesignacionCatastralPosicional.Status == FieldStatus.Missing) warnings.Add("DesignacionCatastralPosicional is missing.");
            if (extraction.Provincia.Status == FieldStatus.Missing) warnings.Add("Provincia is missing.");
            if (extraction.Municipio.Status == FieldStatus.Missing) warnings.Add("Municipio is missing.");
            if (extraction.SuperficieARegistrarParcelaM2.Status == FieldStatus.Missing) warnings.Add("Superficie is missing.");

            if (warnings.Any())
            {
                extraction = extraction with { ExtractionStatus = ExtractionStatus.Incomplete, Warnings = warnings };
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
            else
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
                        if (fieldType == "Operacion" && !labelPattern.Equals(@"OPERACION", StringComparison.OrdinalIgnoreCase))
                        {
                            rawValue = line;
                            break;
                        }

                        var inlineMatch = Regex.Match(line, $@"{labelPattern}\s*[:\-]?\s*(.+)", RegexOptions.IgnoreCase);
                        if (inlineMatch.Success && !string.IsNullOrWhiteSpace(inlineMatch.Groups[1].Value))
                        {
                            rawValue = inlineMatch.Groups[1].Value;
                            
                            // Let's refine for DEPARTAMENTOESTE or DEPARTAMENTONORTE
                            if (labelPattern == @"DEPARTAMENTO") 
                            {
                                var textWithoutDep = Regex.Replace(line, @"DEPARTAMENTO", "", RegexOptions.IgnoreCase).Trim();
                                if (!string.IsNullOrWhiteSpace(textWithoutDep)) {
                                    rawValue = textWithoutDep;
                                }
                            }
                        }
                        
                        // Check next line for proximity block if empty or too short
                        if ((string.IsNullOrWhiteSpace(rawValue) || rawValue.Length < 3) && i + 1 < lines.Count)
                        {
                            var nextLine = lines[i + 1];
                            if (!Regex.IsMatch(nextLine, @"^(PROVINCIA|MUNICIPIO|SECCION|LUGAR|DEPARTAMENTO|TIPO|ESCALA|HOJA|LAMINA|DESIGNACION)", RegexOptions.IgnoreCase))
                            {
                                rawValue = nextLine;
                            }
                        }
                        break;
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
                
                // Apply SharedFieldNormalizer if needed based on fieldType
                switch (fieldType)
                {
                    case "DesignacionCatastralPosicional":
                    case "DesignacionCatastralOrigen":
                        normalizedValue = SharedFieldNormalizer.NormalizeDesignacionCatastral(rawValue);
                        break;
                    case "SuperficieM2":
                        normalizedValue = SharedFieldNormalizer.NormalizeSuperficie(rawValue);
                        break;
                    case "Escala":
                        normalizedValue = SharedFieldNormalizer.NormalizeEscala(rawValue);
                        break;
                    case "Operacion":
                        normalizedValue = SharedFieldNormalizer.NormalizeOperacion(rawValue);
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
}
