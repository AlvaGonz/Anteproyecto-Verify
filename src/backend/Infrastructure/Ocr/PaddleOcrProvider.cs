namespace Infrastructure.Ocr;

using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Ocr;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

public class PaddleOcrProvider : IOcrProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PaddleOcrProvider> _logger;
    private readonly string _baseUrl;

    public PaddleOcrProvider(HttpClient httpClient, IConfiguration configuration, ILogger<PaddleOcrProvider> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = configuration["Ocr:PaddleOcrBaseUrl"] ?? "http://paddleocr-api:8000";
    }

    public async Task<OcrResult> ProcessDocumentAsync(Stream documentStream, string fileName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing document via PaddleOCR {FileName}", fileName);
        
        using var content = new MultipartFormDataContent();
        
        // Ensure stream is at beginning
        if (documentStream.CanSeek)
        {
            documentStream.Position = 0;
        }

        var fileContent = new StreamContent(documentStream);
        content.Add(fileContent, "file", fileName);

        var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/api/v1/ocr/extract")
        {
            Content = content
        };

        try
        {
            var response = await _httpClient.SendAsync(request, cancellationToken);
            var responseString = await response.Content.ReadAsStringAsync(cancellationToken);
            
            if (response.IsSuccessStatusCode)
            {
                var result = JsonSerializer.Deserialize<JsonElement>(responseString);
                var success = result.TryGetProperty("Success", out var successProp) && successProp.GetBoolean();
                var text = result.TryGetProperty("ExtractedText", out var textProp) ? textProp.GetString() : string.Empty;
                var rawJson = result.TryGetProperty("RawJson", out var rawProp) ? rawProp.GetString() : responseString;
                
                // Parse RawJson into OcrLine objects with bounding boxes for spatial region extraction
                var lines = new List<OcrLine>();
                if (!string.IsNullOrWhiteSpace(rawJson))
                {
                    var cleanJson = rawJson.Replace("\\\"", "\"");
                    // Pattern matches: [[[x1, y1], [x2, y2], [x3, y3], [x4, y4]], ('text', confidence)]
                    var bboxMatches = Regex.Matches(cleanJson, @"\[\s*\[\s*\[\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\]\s*,\s*\[\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\]\s*,\s*\[\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\]\s*,\s*\[\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\]\s*\]\s*,\s*\(\s*['""](.*?)['""]\s*,\s*([\d\.\-]+)\s*\)\s*\]");
                    
                    if (bboxMatches.Count > 0)
                    {
                        foreach (Match m in bboxMatches)
                        {
                            if (m.Groups.Count >= 11 && !string.IsNullOrWhiteSpace(m.Groups[9].Value))
                            {
                                double.TryParse(m.Groups[1].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var x1);
                                double.TryParse(m.Groups[2].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var y1);
                                double.TryParse(m.Groups[3].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var x2);
                                double.TryParse(m.Groups[4].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var y2);
                                double.TryParse(m.Groups[5].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var x3);
                                double.TryParse(m.Groups[6].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var y3);
                                double.TryParse(m.Groups[7].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var x4);
                                double.TryParse(m.Groups[8].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var y4);
                                
                                var textVal = m.Groups[9].Value;
                                double.TryParse(m.Groups[10].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var conf);

                                var minX = Math.Min(Math.Min(x1, x2), Math.Min(x3, x4));
                                var maxX = Math.Max(Math.Max(x1, x2), Math.Max(x3, x4));
                                var minY = Math.Min(Math.Min(y1, y2), Math.Min(y3, y4));
                                var maxY = Math.Max(Math.Max(y1, y2), Math.Max(y3, y4));

                                lines.Add(new OcrLine
                                {
                                    Text = textVal,
                                    Confidence = conf > 0 ? conf : 0.9,
                                    BoundingBox = new OcrBoundingBox
                                    {
                                        Left = minX,
                                        Top = minY,
                                        Right = maxX,
                                        Bottom = maxY
                                    }
                                });
                            }
                        }
                    }
                    else if (cleanJson.Contains("('"))
                    {
                        var matches = Regex.Matches(cleanJson, @"\('(.*?)',\s*(\d+\.\d+)");
                        foreach (Match m in matches)
                        {
                            if (m.Groups.Count > 1 && !string.IsNullOrWhiteSpace(m.Groups[1].Value))
                            {
                                lines.Add(new OcrLine 
                                { 
                                    Text = m.Groups[1].Value,
                                    Confidence = double.TryParse(m.Groups[2].Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var c) ? c : 0.9
                                });
                            }
                        }
                    }
                }
                
                // Fallback: if RawJson parsing produced no lines, split ExtractedText by newlines only.
                // Splitting by SPACES (as previously done) destroys the visual line structure that
                // the mapper relies on for label+proximity extraction, causing all fields to be
                // missed on real PDFs. Newlines preserve the visual structure.
                if (lines.Count == 0 && !string.IsNullOrWhiteSpace(text))
                {
                    var splitLines = text.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var line in splitLines)
                    {
                        var trimmed = line.Trim();
                        if (!string.IsNullOrWhiteSpace(trimmed))
                        {
                            lines.Add(new OcrLine { Text = trimmed, Confidence = 0.9 });
                        }
                    }
                }

                return new OcrResult
                {
                    Success = success,
                    ExtractedText = text ?? string.Empty,
                    RawJson = rawJson ?? string.Empty,
                    Confidence = 0.9,
                    Lines = lines
                };
            }
            
            _logger.LogError("PaddleOCR API failed with status code {StatusCode}: {Response}", response.StatusCode, responseString);
            var errorPayload = string.IsNullOrWhiteSpace(responseString)
                ? $"{{\"error\": \"OCR service returned {(int)response.StatusCode}\"}}"
                : responseString;
            return new OcrResult { Success = false, ExtractedText = string.Empty, RawJson = errorPayload };
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error communicating with PaddleOCR API");
            var safeMessage = string.IsNullOrWhiteSpace(ex.Message) ? "Connection error" : ex.Message;
            return new OcrResult { Success = false, ExtractedText = string.Empty, RawJson = $"{{\"error\": \"{safeMessage.Replace("\"", "'")}\"}}"};
        }
    }
    
    public async Task<OcrResult> ExtractAsync(Stream fileStream, string contentType, CancellationToken cancellationToken = default)
    {
        return await ProcessDocumentAsync(fileStream, "document.pdf", cancellationToken);
    }

    public Task<IReadOnlyDictionary<string, OcrField>> GetStructuredFieldsAsync(OcrResult result)
    {
        IReadOnlyDictionary<string, OcrField> fields = new System.Collections.Generic.Dictionary<string, OcrField>();
        return Task.FromResult(fields);
    }

    public double GetConfidenceScore(OcrResult result)
    {
        return result.Confidence;
    }
}
