using System;
using System.Collections.Generic;
using System.Text.Json;

public class Program
{
    public class OcrResult
    {
        public Dictionary<string, OcrField> Fields { get; init; } = new();
    }
    public class OcrField
    {
        public string Value { get; set; }
    }
    public static void Main()
    {
        var ocr = new OcrResult();
        ocr.Fields["cedulaNumber"] = new OcrField { Value = "123" };
        var opts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(ocr, opts);
        Console.WriteLine(json);
        
        var back = JsonSerializer.Deserialize<OcrResult>(json, opts);
        Console.WriteLine(back.Fields.ContainsKey("cedulaNumber"));
    }
}
