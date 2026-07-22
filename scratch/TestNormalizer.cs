using System;
using Infrastructure.DocumentProcessing;
using Application.Abstractions.Ocr;
using Domain.Enums;
using System.Text.Json;

class Program {
    static void Main() {
        var normalizer = new DocumentFieldNormalizer();
        var ocrResult = new OcrResult { 
            ExtractedText = "REPUBLICA Junta CentralElectoral CEDULADEIDENTIDAD DOMINICANA Y ELECTORAL Nümero de cédula 1) 012345 001-0000000-9 Nombre MARiA KAREN Apellido SANCHEZ ESTELAR Nacionalidad Estado civil DOMINICANA SOLTERA B- Fecha de nacimiento Sexo 08NOVIEMBRE2001 F Lugar de nacimiento Firma 08711701 SANTO DOMINGO Ocupación u oficio Vigencia hasta05-12-2038 INGENIERO INDUSTRIAL"
        };
        
        var fields = normalizer.Normalize(ocrResult, DocumentType.ID);
        var options = new JsonSerializerOptions { WriteIndented = true };
        Console.WriteLine(JsonSerializer.Serialize(fields, options));
    }
}
