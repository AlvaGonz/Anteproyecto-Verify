using System;
using System.IO;
using System.Text.Json;
using Application.Documents.Extractions;
using Application.Abstractions.Ocr;

namespace OcrTest
{
    class Program
    {
        static void Main(string[] args)
        {
            var ocrJson = File.ReadAllText(@"..\temp_ocr_utf8.json");
            var result = JsonSerializer.Deserialize<OcrResult>(ocrJson);

            var extraction = PlanoMensuraCatastralRdPaddleMapper.MapFromOcrResult(result!);

            var json = JsonSerializer.Serialize(extraction, new JsonSerializerOptions { WriteIndented = true });
            Console.WriteLine(json);
        }
    }
}
