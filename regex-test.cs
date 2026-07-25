using System;
using System.Text.RegularExpressions;

class Program
{
    static void Main()
    {
        string fullText = "CERTIFICACION IPI NO. DE CERTIFICACION CERT-2024-001234 NO. INMUEBLE INM-456789 PARCELA NO. 3094667545124-AD";
        string p = @"(?:PARCELA\s*NO\.|PARCELA\s*N[ÚU]MERO|N[ÚU]MERO\s*DE\s*PARCELA|PARCELA\s*NO|NO\s*PARCELA|NUMERO\s*PARCELA)\s*[:\-]?\s*([A-Z0-9\-\/]+)";
        var match = Regex.Match(fullText, p, RegexOptions.IgnoreCase);
        if (match.Success)
        {
            Console.WriteLine("Matched: " + (match.Groups.Count > 1 ? match.Groups[1].Value : match.Value));
        }
        else
        {
            Console.WriteLine("No match");
        }
    }
}
