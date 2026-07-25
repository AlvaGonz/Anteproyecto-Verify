using System;
using System.Text.RegularExpressions;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var rawJson = "[[[[0, 0], [1, 1], [1, 1], [0, 1]], ('CERTIFICACION IPI', 0.99)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('NO. DE CERTIFICACION', 0.98)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('CERT-2024-001234', 0.97)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('NO. INMUEBLE', 0.96)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('INM-456789', 0.95)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('PARCELA NO.', 0.94)], [[[0, 0], [1, 1], [1, 1], [0, 1]], ('3094667545124-AD', 0.93)]]";
        var lines = new List<string>();
        var matches = Regex.Matches(rawJson.Replace("\\\"", "\""), @"\('(.*?)',\s*(\d+\.\d+)");
        foreach (Match m in matches)
        {
            lines.Add(m.Groups[1].Value);
        }
        Console.WriteLine("Lines count: " + lines.Count);
        string fullText = string.Join(" ", lines);
        Console.WriteLine("Full text: " + fullText);

        // Layer 1/2 test
        string rawValue = null;
        var labelPatterns = new[] { 
            @"PARCELA\s*NO\.?", 
            @"PARCELA\s*N[ÚU]MERO", 
            @"N[ÚU]MERO\s*DE\s*PARCELA",
            @"NO\.?\s*PARCELA",
            @"NUMERO\s*PARCELA"
        };
        for (int i = 0; i < lines.Count; i++)
        {
            var line = lines[i];
            foreach (var labelPattern in labelPatterns)
            {
                if (Regex.IsMatch(line, labelPattern, RegexOptions.IgnoreCase))
                {
                    var inlineMatch = Regex.Match(line, $@"{labelPattern}\s*[:\-]?\s*(.+)", RegexOptions.IgnoreCase);
                    if (inlineMatch.Success && !string.IsNullOrWhiteSpace(inlineMatch.Groups[1].Value))
                    {
                        rawValue = inlineMatch.Groups[1].Value;
                        Console.WriteLine("Layer 1 Match: " + rawValue);
                        break;
                    }
                    if (i + 1 < lines.Count && !Regex.IsMatch(lines[i + 1], @"^[A-ZÁÉÍÓÚ\s\.\:\-]+$"))
                    {
                        rawValue = lines[i + 1];
                        Console.WriteLine("Layer 2 Match: " + rawValue);
                        break;
                    }
                }
            }
            if (rawValue != null) break;
        }

        if (string.IsNullOrWhiteSpace(rawValue))
        {
            Console.WriteLine("Layer 1/2 Failed!");
            var regexPatterns = new[] { 
                @"(?:PARCELA\s*NO\.|PARCELA\s*N[ÚU]MERO|N[ÚU]MERO\s*DE\s*PARCELA|PARCELA\s*NO|NO\s*PARCELA|NUMERO\s*PARCELA)\s*[:\-]?\s*([A-Z0-9\-\/]+)",
                @"(?:PARCELA\s*)([A-Z0-9\-\/]{4,})"
            };
            foreach (var p in regexPatterns)
            {
                var match = Regex.Match(fullText, p, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    Console.WriteLine("Layer 3 Match: " + (match.Groups.Count > 1 ? match.Groups[1].Value : match.Value));
                }
            }
        }
    }
}
