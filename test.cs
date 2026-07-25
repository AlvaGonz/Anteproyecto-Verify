using System;
using System.Text.RegularExpressions;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var lines = new List<string> { ""PARCELA NO."", ""3094667545124-AD"" };
        var labelPatterns = new[] { @""PARCELA\s*NO\.?"" };
        string rawValue = null;
        for (int i = 0; i < lines.Count; i++) {
            var line = lines[i];
            foreach (var labelPattern in labelPatterns) {
                if (Regex.IsMatch(line, labelPattern, RegexOptions.IgnoreCase)) {
                    var inlineMatch = Regex.Match(line, $@""{labelPattern}\s*[:\-]?\s*(.+)"", RegexOptions.IgnoreCase);
                    if (inlineMatch.Success && !string.IsNullOrWhiteSpace(inlineMatch.Groups[1].Value)) {
                        rawValue = inlineMatch.Groups[1].Value;
                        break;
                    }
                    if (i + 1 < lines.Count && !Regex.IsMatch(lines[i + 1], @""^[A-ZÁÉÍÓÚ\s\.\:\-]+$"")) {
                        rawValue = lines[i + 1];
                        break;
                    }
                }
            }
            if (rawValue != null) break;
        }
        Console.WriteLine($""Result: {rawValue}"");
    }
}
