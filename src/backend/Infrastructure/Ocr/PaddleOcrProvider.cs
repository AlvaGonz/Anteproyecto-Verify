namespace Infrastructure.Ocr;

using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Ocr;
using Microsoft.Extensions.Logging;

public class PaddleOcrProvider : IOcrProvider
{
    private readonly ILogger<PaddleOcrProvider> _logger;

    public PaddleOcrProvider(ILogger<PaddleOcrProvider> logger)
    {
        _logger = logger;
    }

    public async Task<OcrResult> ProcessDocumentAsync(Stream documentStream, string fileName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Simulating OCR processing for {FileName}", fileName);
        
        // Simulating processing delay
        await Task.Delay(100, cancellationToken);

        var result = new OcrResult
        {
            Success = true,
            ExtractedText = "Simulated text from PaddleOCR stub.",
            RawJson = JsonSerializer.Serialize(new { Result = "Simulated", Text = "Simulated text from PaddleOCR stub." })
        };

        return result;
    }
}
