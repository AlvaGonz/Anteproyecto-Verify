using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using System.Linq;

namespace TestOcr {
class TestRegex
{
    static void Main()
    {
        string jsonA = File.ReadAllText("./ocr_a.json");
        ExtractAndPrint(jsonA, "A");
        
        string jsonB = File.ReadAllText("./ocr_b.json");
        ExtractAndPrint(jsonB, "B");
    }

    static void ExtractAndPrint(string content, string name)
    {
        Console.WriteLine($"\n--- OCR {name} ---");
        var match = Regex.Match(content, @"""RawJson"":\s*""(.*?)""");
        if (match.Success)
        {
            string rawJson = match.Groups[1].Value.Replace("\\\"", "\"");
            var matches = Regex.Matches(rawJson, @"\('(.*?)',\s*(\d+\.\d+)");
            List<string> lines = new List<string>();
            foreach (Match m in matches)
            {
                lines.Add(m.Groups[1].Value);
            }
            string fullText = string.Join(" ", lines);
            
            Console.WriteLine("Oficina: " + Map(fullText, @"(Registro de T[ií]tulos(?:de|\s+de)?\s*[a-zA-ZñÑ\s]+)", @"(REGISTRO\s+DE\s+T[ií]TULOS\s+(?:DE\s+)?[a-zA-ZñÑ\s]+)"));
            Console.WriteLine("Designacion: " + Map(fullText, @"Parce[l]?a\s*(?:dl DoCra Ha\.|del Distrito Catastral No\.)?\s*([\d\.]+(?:\.DC\d+)?)", @"(Parce[l]?a\s*\S+)"));
            Console.WriteLine("Fecha: " + Map(fullText, @"(?:Em[a-zA-Z]*do\s*el|Emitido\s*el)\s*(\d{1,2}\s*de\s*[a-zA-Z]+\s*del\s*\d{4})", @"(\d{1,2}\s*de\s*[a-zA-Z]+\s*del\s*\d{4})"));
            Console.WriteLine("Superficie: " + Map(fullText, @"(\d{1,3}(?:[,.]\d{3})*(?:[,.]\d+)?)\s*(?:m2|m²|m\b|mtros\.cuadrados|metros cuadrados)"));
            Console.WriteLine("Municipio: " + Map(fullText, @"ubicado en\s*([a-zA-Z\s]+?)(?:,([a-zA-Z\s]+))?\.El derecho", @"(Santo Domingo|Bonao)"));
            Console.WriteLine("Provincia: " + Map(fullText, @"ubicado en\s*[a-zA-Z\s]+?,([a-zA-Z\sñÑ]+)\.El derecho"));
            Console.WriteLine("VieneDe: " + Map(fullText, @"(cancela la anterior|viene de)"));
        }
    }
    
    static string Map(string text, params string[] patterns)
    {
        foreach(var p in patterns) {
            var m = Regex.Match(text, p, RegexOptions.IgnoreCase);
            if(m.Success) {
                // If the pattern has groups, return the first captured group (not the whole match)
                if (m.Groups.Count > 1) {
                    return m.Groups[1].Value.Trim();
                }
                return m.Value.Trim();
            }
        }
        return "Missing";
    }
}
}
