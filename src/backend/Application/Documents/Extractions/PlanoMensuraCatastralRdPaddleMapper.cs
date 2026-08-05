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
                    new[] { @"OPERACION", @"OPERACIOSUBDISION", @"OPEACIONSUBDIVISIN", @"OPERACIONSUBDIVISION" },
                    new[] { @"OPERACION\s*[A-Za-z]*\s*[:\-]?\s*([A-Za-z]+)", @"(SUBDIVISION|PLANO\s*CATASTRAL|SANEAMIENTO|DESLINDE|REFUNDICION)" }),

                DesignacionCatastralPosicional = ExtractField(lines, fullText, "DesignacionCatastralPosicional",
                    new[] { @"DESIGNACION\s*CATASTRAL\s*POSICIONAL", @"DESIGNACIONCATASTRALPOSICIONAL", @"DESIGNACION\s*TEMPORA", @"DCP" },
                    new[] { @"(?:DESIGNACION\s*CATASTRAL\s*POSICIONAL:?|DESIGNACIONCATASTRALPOSICIONAL)\s*(?:CATASTRAL\s*DE\s*ORIGEN\s*(?:CALLE|PARCELA)\s*|CATASTRALDEORIGEN\s*|DESIGNACION\s*TEMPORA(?:L)?\s*)?([\d_-]+)", @"\b(\d{12})\b", @"(505[\d_-]+)", @"(420[\d_-]+)" }),

                DesignacionCatastralOrigen = ExtractField(lines, fullText, "DesignacionCatastralOrigen",
                    new[] { @"CATASTRAL DE ORIGEN(?: TEMPORAL)?", @"TEMPORAL:" },
                    new[] { @"(?:CATASTRAL DE ORIGEN(?: TEMPORAL)?:?|TEMPORAL:)\s*([\d_-]+)", @"(420[\d_-]+)" }),

                Provincia = ExtractField(lines, fullText, "Provincia",
                    new[] { @"PROVINCIA" },
                    new[] { @"PROVINCIA:?\s*([a-zA-Z\s]+?)(?=\s*1\s*No\.|\s*ESCALA|\s*MUNICIPIO|\s*SECCION|\s*LUGAR|\s*SUPERFICIE|$)", @"(?:PROVINCIA:?\s*)([A-Z\s]{4,})" }),

                Municipio = ExtractField(lines, fullText, "Municipio",
                    new[] { @"MUNICIPIO", @"IUNICIPIO" },
                    new[] { @"MUNICIPIO:?\s*([a-zA-Z\s]+?)(?=\s*SECCION|\s*LUGAR|\s*PROVINCIA|\s*SUPERFICIE|$)", @"(?:MUNICIPIO:?\s*)([A-Z\s]{4,})" }),

                Seccion = ExtractField(lines, fullText, "Seccion",
                    new[] { @"SECCI[OÓ]N", @"SECCI", @"SECCION\s*[A-Z]" },
                    new[] { @"SECCI[OÓ]N:?\s*([a-zA-Z\s]+?)(?=\s*LUGAR|\s*PROVINCIA|\s*MUNICIPIO|\s*SUPERFICIE|$)", @"(?:SECCI[OÓ]N:?\s*)([A-Z\s]{4,})", @"SECCION([A-Z]+)" }),

                Lugar = ExtractField(lines, fullText, "Lugar",
                    new[] { @"LUGAR", @"LUGARTDC" },
                    new[] { @"LUGAR:?\s*([a-zA-Z\s]+?)(?=\s*PROVINCIA|\s*MUNICIPIO|\s*SECCION|\s*SUPERFICIE|$)", @"(?:LUGAR:?\s*)([A-Z\s]{4,})", @"MUNICIPIO\s+\S+\s+([A-Z]{3,})(?=\s+(?:SECCION|SUPERFICIE|$))" }),

                SuperficieARegistrarParcelaM2 = ExtractField(lines, fullText, "SuperficieM2",
                    new[] { @"SUPERFICIE\s*(?:A\s*REGISTRAR\s*)?PARCELA:?", @"SUPERFICIE\s*A\s*REGISTRAR:?", @"SUPERFICIE:?", @"FICIEAREGISTRAR" },
                    new[] { @"(?:SUPERFICIE(?: A REGISTRAR)? PARCELA:?)\s*([\d,.]+)", @"(?:SUPERFICIE A REGISTRAR|FICIEAREGISTRAR)\s*PARCELA:?\s*([\d,.]+)", @"([\d,.]+)\s*m2", @"([\d,.]+)\s*m\b" })
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
                        
                        // Check next line for proximity block if empty or too short
                        if ((string.IsNullOrWhiteSpace(rawValue) || rawValue.Length < 3) && i + 1 < lines.Count)
                        {
                            var nextLine = lines[i + 1];
                            if (!Regex.IsMatch(nextLine, @"^(PROVINCIA|MUNICIPIO|SECCION|LUGAR|DEPARTAMENTO|TIPO|HOJA|LAMINA|DESIGNACION|CALLE|PARCELA|SUPERFICIE)", RegexOptions.IgnoreCase))
                            {
                                rawValue = nextLine;
                            }
                            else if (i + 2 < lines.Count)
                            {
                                var lineAfter = lines[i + 2];
                                if (!Regex.IsMatch(lineAfter, @"^(PROVINCIA|MUNICIPIO|SECCION|LUGAR|DEPARTAMENTO|TIPO|HOJA|LAMINA|DESIGNACION|CALLE|PARCELA|SUPERFICIE)", RegexOptions.IgnoreCase))
                                {
                                    rawValue = lineAfter;
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
                rawValue = Regex.Replace(rawValue, @"^CATASTRALDEORIGEN", "", RegexOptions.IgnoreCase);
            }

            if (!string.IsNullOrWhiteSpace(rawValue) && fieldType == "SuperficieM2")
            {
                rawValue = Regex.Replace(rawValue, @"^PARCELA\s*", "", RegexOptions.IgnoreCase);
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
