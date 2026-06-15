namespace Application.Abstractions.DocumentIntelligence;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

public interface IAiDiagnosisService
{
    Task<AiDiagnosisResult> GenerateDiagnosisAsync(
        Guid projectId,
        IReadOnlyList<DocumentContext> documents,
        CancellationToken cancellationToken = default);
}

public record DocumentContext(
    string Type,
    string Status,
    string? OcrSummary,
    DateTime UploadedAt);

public record AiDiagnosisResult(
    int Score,
    string Summary,
    IReadOnlyList<string> MissingDocuments,
    IReadOnlyList<string> Recommendations);
