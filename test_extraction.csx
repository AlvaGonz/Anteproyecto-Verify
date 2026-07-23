#r "src/backend/Application/bin/Release/net8.0/Application.dll"
#r "src/backend/Domain/bin/Release/net8.0/Domain.dll"

using System;
using System.IO;
using System.Text.Json;
using Application.Documents.Extractions;
using Application.Abstractions.Ocr;

var ocrJson = File.ReadAllText("ocr_result_fixture_c.json");
var result = JsonSerializer.Deserialize<OcrResult>(ocrJson);

var mapper = new PlanoMensuraCatastralRdPaddleMapper();
var extraction = mapper.Map(result);

var json = JsonSerializer.Serialize(extraction, new JsonSerializerOptions { WriteIndented = true });
Console.WriteLine(json);
