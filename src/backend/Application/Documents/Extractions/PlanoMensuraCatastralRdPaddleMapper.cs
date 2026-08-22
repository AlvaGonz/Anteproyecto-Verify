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
                    new[] { @"DEPARTAMENTO\s*[_:\-\s]*([a-zA-Z]+)", @"(ESTE|NORTE|SUR|OESTE|CENTRAL)" }),

                Operacion = ExtractField(lines, fullText, "Operacion",
                    new[] { @"OPERACION", @"OPERACIOSUBDISION", @"OPEACIONSUBDIVISIN", @"OPERACIONSUBDIVISION" },
                    new[] { @"OPERACION\s*[A-Za-z]*\s*[:\-]?\s*([A-Za-z]+)", @"(SUBDIVISION|PLANO\s*CATASTRAL|SANEAMIENTO|DESLINDE|REFUNDICION)" }),

                DesignacionCatastralPosicional = ExtractField(lines, fullText, "DesignacionCatastralPosicional",
                    new[] { @"DESIGNACION\s*CATASTRAL\s*POSICIONAL", @"DESIGNACIONCATASTRALPOSICIONAL", @"\bDCP\b", @"\b0CP\b", @"\bOCP\b", @"POSICIONAL" },
                    new[] { @"(?:DCP|POSICIONAL|[0OD]CP|[0OD]\.C\.P\.)[:\s_]*([0-9]{11,14})", @"\b([1-8]\d{11})\b", @"(?:DESIGNACION\s*CATASTRAL\s*POSICIONAL:?|DESIGNACIONCATASTRALPOSICIONAL)\s*(?:CATASTRAL\s*DE\s*ORIGEN\s*(?:CALLE|PARCELA)\s*|CATASTRALDEORIGEN\s*)?([\d_-]{6,16})", @"(875[\d_-]+)", @"(505[\d_-]+)", @"(420[\d_-]+)" }),

                DesignacionCatastralOrigen = ExtractField(lines, fullText, "DesignacionCatastralOrigen",
                    new[] { @"\bCATASTRAL\s+DE\s+ORIGEN\b", @"CATASTRAL DE ORIGEN", @"DESIGNACION\s+TEMPORAL", @"TEMPORAL:", @"DESIGNACION CATASTRAL ORIGEN", @"\bDCO\b" },
                    new[] { @"(Parc\.?\s*\d+,\s*DC-\d+)", @"(?:CATASTRAL DE ORIGEN(?: TEMPORAL)?:?|TEMPORAL:|DESIGNACION TEMPORAL:?|\bDCO:?\b)\s*(Parc\.?\s*\d+,\s*DC-\d+|[\d_-]+)", @"(420[\d_-]+)" }),

                Provincia = ExtractField(lines, fullText, "Provincia",
                    new[] { @"PR\s*OVINCIA", @"PROVINCIA" },
                    new[] { @"(?:PR\s*OVINCIA:?\s*)([A-ZÁÉÍÓÚÑ\s]{4,})", @"PROVINCIA:?\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+?)(?=\s*1\s*No\.|\s*ESCALA|\s*MUNICIPIO|\s*SECCI[OÓ]N|\s*LUGAR|\s*SUPERFICIE|\s*SUPERPICIE|$)" }),

                Municipio = ExtractField(lines, fullText, "Municipio",
                    new[] { @"MUNICIPIO", @"IUNICIPIO" },
                    new[] { @"MUNICIPIO:?\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+?)(?=\s*SECCI[OÓ]N|\s*LUGAR|\s*PROVINCIA|\s*SUPERFICIE|\s*SUPERPICIE|$)", @"(?:MUNICIPIO:?\s*)([A-ZÁÉÍÓÚÑ\s]{4,})" }),

                Seccion = ExtractField(lines, fullText, "Seccion",
                    new[] { @"SECCI[OÓ]N", @"SECCI", @"SECCION\s*[A-Z]" },
                    new[] { @"SECCI[OÓ]N:?\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+?)(?=\s*LUGAR|\s*PROVINCIA|\s*MUNICIPIO|\s*SUPERFICIE|\s*SUPERPICIE|$)", @"(?:SECCI[OÓ]N:?\s*)([A-ZÁÉÍÓÚÑ\s]{4,})", @"SECCION([A-ZÁÉÍÓÚÑ]+)" }),

                Lugar = ExtractField(lines, fullText, "Lugar",
                    new[] { @"LUGAR", @"LUGARTDC" },
                    new[] { @"LUGAR:?\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+?)(?=\s*PROVINCIA|\s*MUNICIPIO|\s*SECCI[OÓ]N|\s*SUPERFICIE|\s*SUPERPICIE|$)", @"(?:LUGAR:?\s*)([A-ZÁÉÍÓÚÑ\s]{4,})", @"MUNICIPIO\s+\S+\s+([A-ZÁÉÍÓÚÑ]{3,})(?=\s+(?:SECCION|SUPERFICIE|$))" }),

                SuperficieARegistrarParcelaM2 = ExtractField(lines, fullText, "SuperficieM2",
                    new[] { @"SUPER[FP]ICIE\s*(?:A\s*R[E!e]?GISTRAR\s*)?PARCELA:?", @"SUPER[FP]ICIE\s*A\s*R[E!e]?GISTRAR:?", @"SUPER[FP]ICIE:?", @"SUPERPICIE", @"FICIEAREGISTRAR", @"SUPERFICIE" },
                    new[] { @"(?:SUPER[FP]ICIE(?: A R[E!e]?GISTRAR)? PARCELA:?)\s*(?:ESCALA[^\n\r]*?)?([\d,.]+)", @"(?:SUPER[FP]ICIE A R[E!e]?GISTRAR|FICIEAREGISTRAR)\s*PARCELA:?\s*([\d,.]+)", @"([\d,.]+)\s*m2\b", @"([\d,.]+)\s*m\b" })
            };

            var warnings = new List<string>();

            if (extraction.DesignacionCatastralPosicional.Status == FieldStatus.Missing ||
                extraction.Provincia.Status == FieldStatus.Missing ||
                extraction.Municipio.Status == FieldStatus.Missing ||
                extraction.SuperficieARegistrarParcelaM2.Status == FieldStatus.Missing)
            {
                extraction = extraction with { ExtractionStatus = ExtractionStatus.Incomplete };
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
                            
                            if (labelPattern == @"DEPARTAMENTO") 
                            {
                                var textWithoutDep = Regex.Replace(line, @"DEPARTAMENTO", "", RegexOptions.IgnoreCase).Trim();
                                if (!string.IsNullOrWhiteSpace(textWithoutDep)) {
                                    rawValue = textWithoutDep;
                                }
                            }

                            if ((fieldType == "DesignacionCatastralPosicional" || fieldType == "DesignacionCatastralOrigen")
                                && !Regex.IsMatch(rawValue, @"\d"))
                            {
                                rawValue = null;
                            }
                        }
                        
                        // Check next lines for proximity block if empty, too short, or noise
                        if ((string.IsNullOrWhiteSpace(rawValue) || rawValue.Length < 3 || (fieldType == "DesignacionCatastralPosicional" && !Regex.IsMatch(rawValue, @"\d{6,}")) || (fieldType == "SuperficieM2" && !Regex.IsMatch(rawValue, @"\d"))) && i + 1 < lines.Count)
                        {
                            for (int step = 1; step <= 3 && i + step < lines.Count; step++)
                            {
                                var candidate = lines[i + step].Trim();
                                if (string.IsNullOrWhiteSpace(candidate)) continue;
                                if (candidate.Length < 2 && !Regex.IsMatch(candidate, @"\d")) continue; // skip noise like "l" or "-"

                                if (fieldType == "SuperficieM2" && Regex.IsMatch(candidate, @"^ESCALA", RegexOptions.IgnoreCase))
                                    continue;

                                if (fieldType == "DesignacionCatastralPosicional")
                                {
                                    var dcpMatch = Regex.Match(candidate, @"(?:DCP\s*)?([0-9_-]{8,20}|\d{6,14})");
                                    if (dcpMatch.Success)
                                    {
                                        rawValue = candidate.StartsWith("DCP", StringComparison.OrdinalIgnoreCase)
                                            ? Regex.Replace(candidate, @"^DCP\s*", "", RegexOptions.IgnoreCase).Trim()
                                            : candidate;
                                        break;
                                    }
                                }
                                else if (fieldType == "DesignacionCatastralOrigen")
                                {
                                    if (Regex.IsMatch(candidate, @"(Parc\.?\s*\d+,\s*DC-\d+|[\d_-]{5,})", RegexOptions.IgnoreCase))
                                    {
                                        rawValue = candidate;
                                        break;
                                    }
                                }
                                else if (fieldType == "SuperficieM2")
                                {
                                    var supMatch = Regex.Match(candidate, @"([\d,.]+)(?:\s*m2)?", RegexOptions.IgnoreCase);
                                    if (supMatch.Success)
                                    {
                                        rawValue = supMatch.Groups[1].Value;
                                        break;
                                    }
                                }
                                else if (!Regex.IsMatch(candidate, @"^(PROVINCIA|MUNICIPIO|SECCION|LUGAR|DEPARTAMENTO|TIPO|HOJA|LAMINA|DESIGNACION|CALLE|PARCELA|SUPERFICIE|SUPERPICIE)", RegexOptions.IgnoreCase))
                                {
                                    rawValue = candidate;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
                if (rawValue != null) break;
            }

            // Layer 3: Regex fallback and refinement
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
            else
            {
                rawValue = Regex.Replace(rawValue, @"(?=\s*(?:1\s*No\.|MUNICIPIO|SECCI[OÓ]N|LUGAR|SUPERFICIE)).*", "", RegexOptions.IgnoreCase).Trim();
            }

            if (!string.IsNullOrWhiteSpace(rawValue)
                && (fieldType == "DesignacionCatastralPosicional" || fieldType == "DesignacionCatastralOrigen"))
            {
                rawValue = Regex.Replace(rawValue, @"^(?:DESIGNACI[OÓ]N\s+CATASTRAL\s+DE\s+ORIGEN|DESIGNACION\s+TEMPORAL|TEMPORAL|DCO|CATASTRALDEORIGEN)\s*[:\-]?\s*", "", RegexOptions.IgnoreCase).Trim();
            }

            if (!string.IsNullOrWhiteSpace(rawValue) && fieldType == "SuperficieM2")
            {
                rawValue = Regex.Replace(rawValue, @"^PARCELA\s*", "", RegexOptions.IgnoreCase);
            }

            // Layer 4: Canonical Normalization
            if (!string.IsNullOrWhiteSpace(rawValue))
            {
                rawValue = rawValue.Trim().TrimEnd('.');
                if (fieldType == "Departamento")
                {
                    rawValue = Regex.Replace(rawValue, @"^[_:\-\s]+|[_:\-\s]+$", "");
                }
                string normalizedValue = rawValue;
                
                // Apply SharedFieldNormalizer if needed based on fieldType
                switch (fieldType)
                {
                    case "Departamento":
                        normalizedValue = rawValue.ToUpperInvariant();
                        break;
                    case "DesignacionCatastralPosicional":
                    case "DesignacionCatastralOrigen":
                        normalizedValue = SharedFieldNormalizer.NormalizeDesignacionCatastral(rawValue);
                        break;
                    case "SuperficieM2":
                        normalizedValue = SharedFieldNormalizer.NormalizeSuperficie(rawValue);
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
