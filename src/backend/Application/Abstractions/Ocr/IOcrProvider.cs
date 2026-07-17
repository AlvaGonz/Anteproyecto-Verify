namespace Application.Abstractions.Ocr;

using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

public interface IOcrProvider
{
    Task<OcrResult> ExtractAsync(Stream fileStream, string contentType, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<string, OcrField>> GetStructuredFieldsAsync(OcrResult result);
    double GetConfidenceScore(OcrResult result);
    
    // Legacy support for older code until refactored
    Task<OcrResult> ProcessDocumentAsync(Stream documentStream, string fileName, CancellationToken cancellationToken = default);
}
