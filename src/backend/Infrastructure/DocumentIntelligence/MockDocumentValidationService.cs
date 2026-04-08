namespace Infrastructure.DocumentIntelligence;

using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.DocumentIntelligence;
using Application.Contracts.Documents;

public class MockDocumentValidationService : IDocumentValidationService
{
    public Task<DocumentValidationResult> ValidateDocumentAsync(Stream fileStream, string contentType, string fileName, CancellationToken cancellationToken = default)
    {
        // Mock implementation
        var result = new DocumentValidationResult
        {
            IsValid = true,
            ValidatedFieldsJson = "{\"titulo\": \"presente\", \"firma\": \"presente\", \"fecha\": \"presente\", \"institucion\": \"presente\"}"
        };

        // Simulate a failure for a specific file name to test the rejection
        if (fileName.Contains("invalid", StringComparison.OrdinalIgnoreCase))
        {
            result.IsValid = false;
            result.MissingFields.Add("institución emisora");
            result.ValidatedFieldsJson = "{\"titulo\": \"presente\", \"firma\": \"presente\", \"fecha\": \"presente\", \"institucion\": \"ausente\"}";
        }

        // Simulate OCR failure
        if (fileName.Contains("ocrfail", StringComparison.OrdinalIgnoreCase))
        {
            result.OcrFailed = true;
            result.IsValid = true; // Still valid, just OCR failed
        }

        return Task.FromResult(result);
    }
}
