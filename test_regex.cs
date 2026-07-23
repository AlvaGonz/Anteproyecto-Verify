using System;
using System.Text.RegularExpressions;
using System.IO;

class Program
{
    static void Main()
    {
        string fullText = "MATRiCULA 3000362328 FECHA Y HORA DE INSCRIPCIóN Oct 1 2024 3:32PM REGISTRO DE TITULOS VIENE DE JURISDICCION INMOBILIARIA MUNICIPIO PODER JUDICIAL : REPUBLICA DOMINICANA HIGUEY PROVINCIA LA ALTAGRACIA OFICINA SUPERFICIE EN METROS CUADRADOS Registro de Titulos de Higüey 12130.0700 DESIGNACION CATASTRAL 505483687149 CERTIFICACIóN DEL ESTADO JURiDICO DEL INMUEBLE EL Registro de Titulos de Higüey CERTIFICA: No.3000362328, ubicado en HIGUEY, LA ALTAGRACIA, se encuentra registrado el asiento: No.335492287. DERECHO DE PROPIEDAD a favor de HIGHPOINT INVESTMENTS, S. A., RNC No.1-30-56538-4. El derecho fue adquirido a MINIARI, S. A. S., RNC No.1-01-81523-1. El derecho tiene su origen en VENTA, segün consta en el documento de fecha 17/sep/2021, Acto bajo firma privada legalizado por DR. JONATHAN RAFAEL GARRIDO BERNAL, notario publico de los del nümero de HIGUEY, con matricula No.7741. Este asiento consta en el Libro de Titulos No.1063, Folio 025, y en el Registro Complementario No.0972 folio RC 148. Inscrito a las 3:34:02 p. m. el 26/jul/2022 El inmueble se encuentra libre de derechos reales accesorios, cargas, gravámenes, anotaciones y/o medidas provisionales. ESTA CERTIFICACION ACREDITA EL ESTADO JURiDICO DEL INMUEBLE A LA FECHA DE SU EMISION. A solicitud de RAUL AUGUSTO REYNOSO ALVAREZ, Cédula de Identidad No.402-2429838-6. Dada el 01 de octubre del 2024. .0.  Massiel Elaine Lizardo Pérez Registro de Titulos de Higüey Pägina No.1 253746139212809426385289 Para validar la información impresa en este documento, puede consultar el sitio: https://servicios.ri.gob.do/consultadeproductos";

        string TestRegex(string name, params string[] patterns)
        {
            foreach (var pattern in patterns)
            {
                var match = Regex.Match(fullText, pattern, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    Console.WriteLine($"{name}: {match.Groups[1].Value.Trim()} (matched '{pattern}')");
                    return match.Groups[1].Value.Trim();
                }
            }
            Console.WriteLine($"{name}: NOT FOUND");
            return null;
        }

        TestRegex("Oficina", 
            @"(Registro\s*de\s*T[ií]tulos\s*(?:de|del)?\s*[\wñÑ\s]{1,30}?)(?:\s*\d|\s*$|\s*Zunda|\s*DESIGNACION|\s*CERTIFICACION)",
            @"(REGISTRO\s+DE\s+T[ií]TULOS\s+(?:DE\s+)?[a-zA-ZñÑ\s]{1,30})");

        TestRegex("Designacion", 
            @"(?:DESIGNACI[OÓ]N\s+CATASTRAL\s*(?:S\s*)?)([\d\-]+)");

        TestRegex("VieneDe", 
            @"(?:cancela la anterior|viene de)\s*(?!JURISDICCION\b|MUNICIPIO\b|PROVINCIA\b)([\w\.\-]{2,30})");

        TestRegex("Municipio", 
            @"MUNICIPIO\s*(?:PODER\s*JUDICIAL\s*:\s*REPUBLICA\s*DOMINICANA\s*)?([a-zA-Z]+)");

        TestRegex("Provincia", 
            @"PROVINCIA\s*([a-zA-Z\s]+?)(?=\s*OFICINA|\s*SUPERFICIE|$)");
    }
}
