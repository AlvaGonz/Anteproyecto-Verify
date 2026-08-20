namespace Application.Documents.Extractions;

using Application.Abstractions.Ocr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

public static class CertificadoTituloRdPaddleMapper
{
    private static readonly HashSet<string> SpanishStopwords = new(StringComparer.OrdinalIgnoreCase)
    {
        "de", "del", "la", "las", "los", "el",
        "y", "e", "o", "u",
        "en", "con", "por", "para", "a", "al",
        "un", "una", "uno",
        "es", "son", "ser", "estar",
        "que", "se", "no", "si", "su",
        "este", "esta", "estos", "estas",
        "ese", "esa", "esos", "esas",
        "aquel", "aquella",
        "como", "le", "lo",
        "sobre", "entre", "hasta", "desde",
    };

    private static readonly string[] KnownAllLabels = new[]
    {
        @"^MATR[IÍ]CULA\b",
        @"^FECHA\s+Y\s*HORA",
        @"^VIENE\s+DE\b",
        @"^VIENEDE\b",
        @"^VIENEFE\b",
        @"^VIENE\.D\b",
        @"^CANCELA\s+LA\s+ANTERIOR\b",
        @"^MUNICIPIO\b",
        @"^PROVINCIA\b",
        @"^OFICINA\b",
        @"^SUPERFICIE\b",
        @"^DESIGNACI[OÓ]N\s+CATASTRAL\b",
        @"^PROPIETARIO\b",
        @"^JURISDICCI[OÓ]N\s+INMOBILIARIA\b",
        @"^PODER\s+JUDICIAL\b",
        @"^REPUBLICA\s+DOMINICANA\b",
        @"^CERTIFICADO\s+DE\s+T[IÍ]TULO\b",
        @"^REGISTRO\s+DE\s+T[IÍ]TULOS$"
    };

    private static bool IsAnyKnownLabel(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return false;
        var trimmed = text.Trim();
        foreach (var pattern in KnownAllLabels)
        {
            if (Regex.IsMatch(trimmed, pattern, RegexOptions.IgnoreCase))
                return true;
        }
        return false;
    }

    private static bool IsValueLike(string? candidate)
    {
        if (string.IsNullOrWhiteSpace(candidate)) return false;
        var trimmed = candidate.Trim();
        if (trimmed.Length < 2) return false;
        if (SpanishStopwords.Contains(trimmed)) return false;
        if (IsAnyKnownLabel(trimmed)) return false;
        return true;
    }

    public static CertificadoTituloRdExtractionV1? MapFromOcrResult(OcrResult ocrResult)
    {
        if (ocrResult == null) return null;

        var rawLines = ocrResult.Lines ?? new List<OcrLine>();
        if (rawLines.Count == 0 && !string.IsNullOrWhiteSpace(ocrResult.ExtractedText))
        {
            rawLines = ocrResult.ExtractedText
                .Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(t => new OcrLine { Text = t.Trim(), Confidence = 0.9 })
                .ToList();
        }

        var lines = rawLines.Select(l => l with { Text = CleanOcrText(l.Text) }).ToList();
        string fullText = string.Join("\n", lines.Select(l => l.Text));

        var extraction = new CertificadoTituloRdExtractionV1
        {
            ExtractionStatus = ocrResult.Success ? ExtractionStatus.Completed : ExtractionStatus.Failed,
            OverallConfidence = ocrResult.Confidence
        };

        // 1. Matricula
        var matriculaField = ExtractFieldFromLines(lines, fullText, "Matricula",
            labelAliases: new[] { @"^MATR[IÍ]CULA\b", @"^MATRICUL\b", @"^MATR[IÍ]CUL\b", @"MATR[IÍ]CULA\s*:" },
            negativeLabels: Array.Empty<string>(),
            valueValidator: val => Regex.IsMatch(val, @"\d{6,}"),
            normalizer: SharedFieldNormalizer.NormalizeMatricula,
            regexFallbacks: new[] {
                @"(?:MATR[IÍ]CULA(?:\s*No\.?)?|MATRICULA|MATRICUL|MATR[IÍ]CUL)\s*[:\-]?\s*([\d]{6,12})",
                @"[Mm]atric[\w\.\s]{0,15}?([\d]{6,12})"
            });

        // 2. DesignacionCatastral
        var designacionField = ExtractFieldFromLines(lines, fullText, "DesignacionCatastral",
            labelAliases: new[] { @"DESIGNACI[OÓ]N\s+CATASTRAL", @"DESIGNACIONCATASTRA", @"PARCELA\b", @"SOLAR\b" },
            negativeLabels: Array.Empty<string>(),
            valueValidator: val => Regex.IsMatch(val, @"\d") && !IsAnyKnownLabel(val),
            normalizer: SharedFieldNormalizer.NormalizeDesignacionCatastral,
            regexFallbacks: new[] {
                @"(?:DESIGNACI[OÓ]N\s+CATASTRAL\s*(?:S\s*)?)([\d\-:]+)",
                @"(\d{12}:\d{4})",
                @"(?:Parce[l]?a\s*(?:dl\s*DoCra\s*Ha\.|del\s*Distrito\s*Catastral\s*No\.)?\s*)([\d\.:]+(?:\s+\d+)?)",
                @"(?:como\s+)?[Pp]arcela\s+(?:dl\s+)?(?:DoCra\s+|de[il]\s+)?(?:Distrito\s+|Distrio\s+|Drito\s+)?(?:Catastral\s+)?(?:Ha\.|No\.?\s*)?([\d][\d\.\s:]{0,15})"
            });

        // 3. FechaYHoraInscripcion
        var fechaField = ExtractFieldFromLines(lines, fullText, "Fecha",
            labelAliases: new[] { @"FECHA\s+Y\s*HORA", @"FECHA\s*YHORADEINSCRIPCION", @"INSCRITO\s+A\s+LAS" },
            negativeLabels: Array.Empty<string>(),
            valueValidator: val => (Regex.IsMatch(val, @"\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}") || Regex.IsMatch(val, @"(?i)\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b")) && !IsAnyKnownLabel(val),
            normalizer: SharedFieldNormalizer.NormalizeFecha,
            regexFallbacks: new[] {
                @"FECHA\s+Y\s*HORA\s+DE\s+INSCRIPCI[OÓ]N\s*[:\-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{4}(?:\s+[0-9]{1,2}:[0-9]{2}(?:\s*[ap]\.?\s*m\.?)?)?)",
                @"(?:Inscrito a las.*?el\s*)(\d{1,2}/[a-zA-Z0-9]+/\d{4})",
                @"(?:FECHA Y HORA DE INSCRIPCION.*?)(?:\d{1,2}/\d{1,2}/\d{4})",
                @"(?:Emitido\s+el\s*)(\d{1,2}\s+de\s+[a-zA-Z]+\s+de[il]\s+\d{4})",
                @"(?:fecha\s*)([0-9]{1,2}\s*de[a-zA-Z\s]+de[il]\s*[0-9]{4})"
            });

        // 4. VieneDe
        var vieneDeField = ExtractFieldFromLines(lines, fullText, "VieneDe",
            labelAliases: new[] { @"^VIENE\s+DE\b", @"^VIENEDE\b", @"^VIENEFE\b", @"^VIENE\.?D[E]?\b", @"^CANCELA\s+LA\s+ANTERIOR\b" },
            negativeLabels: Array.Empty<string>(),
            valueValidator: val => IsValueLike(val) && (Regex.IsMatch(val, @"\d") || Regex.IsMatch(val, @"[A-Za-z]\.\d")),
            normalizer: SharedFieldNormalizer.NormalizeVieneDe,
            regexFallbacks: new[] {
                @"(?:cancela la anterior|viene de|vienede|vienefe|viene\.d)\s*[:\-]?\s*(?!JURISDICCION\b|MUNICIPIO\b|PROVINCIA\b)([A-Za-z0-9\.,\-_/ ]{2,30})",
                @"(?:cancela la anterior|viene de|vienede|vienefe|viene\.d).{0,50}?([LFlf]\.?\s*\d+[\s,]*[LFlfXxFf]\.?\s*\d+|\.?\d+\.?\s*[LFlf]\.?\s*\d+)",
                @"\b([Ff]\.\s*\d+[\s,]*[Xx]\.?\s*\d+)\b",
                @"\b([Ll]\.\s*\d+[\s,]*[Ff]\.?\s*\d+)\b"
            });

        // 5. Oficina: Prioritize specific OFICINA form label over general REGISTRO DE TITULOS banner
        var oficinaField = ExtractFieldFromLines(lines, fullText, "Oficina",
            labelAliases: new[] { @"^OFICINA\b", @"OFICINA\s*:", @"^OFICINA\s+DE\s+REGISTRO\b" },
            negativeLabels: new[] { @"^REGISTRO\s+DE\s+T[IÍ]TULOS$" },
            valueValidator: val => IsValueLike(val) && !Regex.IsMatch(val, @"\d{1,2}/\d{1,2}/\d{4}") && !Regex.IsMatch(val, @"(?i)FECHA|MATRICULA|SUPERFICIE"),
            normalizer: SharedFieldNormalizer.NormalizeOficina,
            regexFallbacks: new[] {
                @"OFICINA\s*[:\-]?\s*([a-zA-ZñÑ\s]{3,35}?)(?=\s*MATR[IÍ]CULA|\s*FECHA|\s*SUPERFICIE|\s*VIENE\s*DE|\s*DESIGNACI[OÓ]N|$)"
            });

        // If specific OFICINA label didn't match, check for "Registro de Títulos de [Lugar]" inline
        if (oficinaField.Status == FieldStatus.Missing)
        {
            var regField = ExtractFieldFromLines(lines, fullText, "Oficina",
                labelAliases: new[] { @"REGISTRO\s+DE\s+T[IÍ]TULOS" },
                negativeLabels: Array.Empty<string>(),
                valueValidator: val => IsValueLike(val) && !Regex.IsMatch(val, @"\d{1,2}/\d{1,2}/\d{4}") && !Regex.IsMatch(val, @"(?i)FECHA|MATRICULA|SUPERFICIE"),
                normalizer: SharedFieldNormalizer.NormalizeOficina,
                regexFallbacks: new[] {
                    @"(?:Registro\s*de\s*T[ií]tulos\s*(?:de|del)?\s*[\wñÑ\s]{1,30}?)(?:\s*\d|\s*$|\s*Zunda|\s*DESIGNACI[OÓ]N|\s*CERTIFICACION|\s*MATR[IÍ]CULA)",
                    @"(?:REGISTRO\s+DE\s+T[ií]TULOS\s+(?:DE\s+)?[a-zA-ZñÑ\s]+)"
                });
            if (regField.Status != FieldStatus.Missing)
            {
                oficinaField = regField;
            }
        }

        // 6. Municipio
        var municipioField = ExtractFieldFromLines(lines, fullText, "Municipio",
            labelAliases: new[] { @"^MUNICIPIO\b", @"MUNICIPIO\s*:" },
            negativeLabels: Array.Empty<string>(),
            valueValidator: val => IsValueLike(val) && Regex.IsMatch(val, @"[a-zA-ZñÑ]{3,}"),
            normalizer: val => CleanGeoText(val),
            regexFallbacks: new[] {
                @"MUNICIPIO\s*[:\-]?\s*(?:PODER\s*JUDICIAL\s*[:\-]?\s*REPUBLICA\s*DOMINICANA\s*)?([a-zA-ZñÑ\s]+?)(?=\s*PROVINCIA|\s*OFICINA|\s*SUPERFICIE|\s*PODER\s*JUDICIAL|$)",
                @"(?:ubicado en)\s*([a-zA-ZñÑ\s]+?)(?:,)",
                @"(Santo Domingo de Guzm[aá]n|Santo Domingo|Bonao|Distrito Nacional|San Pedro de Macor[ií]s|Hig[uü]ey|Ban[ií])"
            });

        // 7. Provincia
        var provinciaField = ExtractFieldFromLines(lines, fullText, "Provincia",
            labelAliases: new[] { @"^PROVINCIA\b", @"PROVINCIA\s*:" },
            negativeLabels: Array.Empty<string>(),
            valueValidator: val => IsValueLike(val) && Regex.IsMatch(val, @"[a-zA-ZñÑ]{3,}"),
            normalizer: val => CleanGeoText(val),
            regexFallbacks: new[] {
                @"PROVINCIA\s*[:\-]?\s*(?:OFICINA\s*)?([a-zA-ZñÑ\s]+?)(?=\s*OFICINA|\s*SUPERFICIE|\s*MUNICIPIO|$)",
                @"(?:Distrito\s+Nacional|San Pedro de Macor[ií]s|La Altagracia|Peravia|Santiago|La Vega)"
            });

        // 8. SuperficieM2
        var superficieField = ExtractFieldFromLines(lines, fullText, "SuperficieM2",
            labelAliases: new[] {
                @"SUPERFICIE\s+EN\s+METROS\s+CUADRADOS",
                @"SUPERFICIE\s+DE\s+MEDIDAS\s+SUPERNACES",
                @"SUPERFICIE\s+DE\s+MEDIDAS\s+SUPERFICIALES",
                @"SUPERFICIE\s+DE\s+MICRO\s*MENSURAS",
                @"SUPERESTE\s+DE\s+MCFROD\s+SUASNAGES",
                @"SUPERESTE\s+DE\s+MCFROD",
                @"SUPERESTE",
                @"MCFROD",
                @"SUASNAGES",
                @"SUPERNACES",
                @"SUPERFICIE\s*M2",
                @"^SUPERFICIE\b"
            },
            negativeLabels: Array.Empty<string>(),
            valueValidator: val => Regex.IsMatch(val, @"\d") && !IsAnyKnownLabel(val),
            normalizer: SharedFieldNormalizer.NormalizeSuperficie,
            regexFallbacks: new[] {
                @"(?:SUPERFICIE\s*EN\s*METROS\s*CUADRADOS|SUPERFICIE\s*M2|SUPERFICIE|SUPERESTE)\s*[:\-]?\s*([\d]+(?:[,.\s\']\d+)*)",
                @"([\d]+(?:[,.\s\']\d+)*)\s*(?:m2|m²|mtros\.cuadrados|metros\s+cuadrados|MTS2|metrs\s*cuadrados)",
                @"(?:supeicie|superficie)\s+de\s*([\d]+(?:[.,]\d+)?)",
                @"(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)\s*(?:m2|m²|metrs?\s*cuadrados?|metros\s*cuadrados?|mtros\.cuadrados?)"
            });

        extraction = extraction with
        {
            Matricula = matriculaField,
            DesignacionCatastral = designacionField,
            FechaYHoraInscripcion = fechaField,
            VieneDe = vieneDeField,
            Oficina = oficinaField,
            Municipio = municipioField,
            Provincia = provinciaField,
            SuperficieM2 = superficieField
        };

        // Extraction Status & Warnings
        var warnings = new List<string>();

        if (extraction.DesignacionCatastral.Status == FieldStatus.Missing || extraction.Matricula.Status == FieldStatus.Missing)
        {
            extraction = extraction with { ExtractionStatus = ExtractionStatus.Incomplete };
            warnings.Add("No se pudo detectar el número de matrícula ni la designación catastral.");
        }

        if (extraction.SuperficieM2.Status == FieldStatus.Missing) warnings.Add("Falta la superficie del inmueble (m²).");
        if (extraction.FechaYHoraInscripcion.Status == FieldStatus.Missing) warnings.Add("Falta la fecha de inscripción del documento.");
        if (extraction.VieneDe.Status == FieldStatus.Missing) warnings.Add("No se encontró la referencia de origen (Viene de).");
        if (extraction.Oficina.Status == FieldStatus.Missing) warnings.Add("No se detectó la oficina de registro.");

        if (warnings.Any())
        {
            extraction = extraction with { Warnings = warnings };
        }

        return extraction;
    }

    private static string CleanGeoText(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
        var clean = raw.Trim();
        clean = Regex.Replace(clean, @"(?i)^PODER\s+JUDICIAL\s*[:\-]?\s*REPUBLICA\s+DOMINICANA\s*", "").Trim();
        clean = Regex.Replace(clean, @"(?i)^(?:OFICINA|SUPERFICIE|PROVINCIA|MUNICIPIO)\s*[:\-]?\s*", "").Trim();
        return clean;
    }

    private static ExtractedField ExtractFieldFromLines(
        List<OcrLine> lines,
        string fullText,
        string fieldName,
        string[] labelAliases,
        string[] negativeLabels,
        Func<string, bool> valueValidator,
        Func<string, string> normalizer,
        string[] regexFallbacks)
    {
        string? rawValue = null;

        for (int i = 0; i < lines.Count; i++)
        {
            var currentLine = lines[i];
            var currentText = currentLine.Text.Trim();

            if (negativeLabels.Any(neg => Regex.IsMatch(currentText, neg, RegexOptions.IgnoreCase)))
            {
                continue;
            }

            foreach (var alias in labelAliases)
            {
                if (Regex.IsMatch(currentText, alias, RegexOptions.IgnoreCase))
                {
                    // 1. Inline extraction: value on same line after label
                    var inlineMatch = Regex.Match(currentText, $@"{alias}\s*[:\-]?\s*(.+)", RegexOptions.IgnoreCase);
                    if (inlineMatch.Success)
                    {
                        var candidate = inlineMatch.Groups[1].Value.Trim();
                        if (valueValidator(candidate))
                        {
                            rawValue = candidate;
                            break;
                        }
                    }

                    // 2. Spatial 2D extraction (if bounding boxes are available)
                    if (currentLine.BoundingBox != null)
                    {
                        var labelBox = currentLine.BoundingBox;
                        var spatialCandidates = lines
                            .Where((other, idx) => idx != i && other.BoundingBox != null)
                            .Where(other =>
                            {
                                var b = other.BoundingBox!;
                                bool isBelow = b.Top >= labelBox.Top && (b.Top - labelBox.Bottom) <= 180;
                                bool isRight = b.Left >= labelBox.Right - 20 && Math.Abs(b.CenterY - labelBox.CenterY) <= 40;
                                return (isBelow || isRight) && valueValidator(other.Text);
                            })
                            .OrderBy(other =>
                            {
                                var b = other.BoundingBox!;
                                double dx = b.CenterX - labelBox.CenterX;
                                double dy = b.CenterY - labelBox.CenterY;
                                return Math.Sqrt(dx * dx + dy * dy);
                            })
                            .ToList();

                        if (spatialCandidates.Any())
                        {
                            rawValue = spatialCandidates.First().Text;
                            break;
                        }
                    }

                    // 3. Next-line proximity fallback (1D line scan)
                    for (int step = 1; step <= 2 && (i + step) < lines.Count; step++)
                    {
                        var candidateLine = lines[i + step].Text.Trim();
                        if (IsAnyKnownLabel(candidateLine)) break;

                        if (valueValidator(candidateLine))
                        {
                            rawValue = candidateLine;
                            break;
                        }
                    }
                }
                if (rawValue != null) break;
            }
            if (rawValue != null) break;
        }

        // 4. Regex fallback across full text
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            foreach (var pattern in regexFallbacks)
            {
                var match = Regex.Match(fullText, pattern, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    var val = match.Groups.Count > 1 ? match.Groups[1].Value.Trim() : match.Value.Trim();
                    if (valueValidator(val))
                    {
                        rawValue = val;
                        break;
                    }
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(rawValue))
        {
            rawValue = rawValue.Trim().TrimEnd('.');
            var normalizedValue = normalizer(rawValue);

            return new ExtractedField
            {
                RawValue = rawValue,
                NormalizedValue = normalizedValue,
                Confidence = 0.85,
                Status = FieldStatus.Valid,
                SourcePage = 1
            };
        }

        return new ExtractedField { Status = FieldStatus.Missing };
    }

    private static string CleanOcrText(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return text;
        
        text = text.Replace("TiTULOS", "TÍTULOS");
        text = text.Replace("TITULOS", "TÍTULOS");
        text = text.Replace("MATRiCULA", "MATRÍCULA");
        text = text.Replace("MATRICULA", "MATRÍCULA");
        text = text.Replace("DESIGNACION", "DESIGNACIÓN");
        
        text = Regex.Replace(text, @"\b(\d+)\s*DC\s*(\d+)\b", "$1-DC-$2", RegexOptions.IgnoreCase);
        
        return text;
    }
}
