namespace Application.Features.Documents.GetDocumentDiagnosis;

using System;
using System.Collections.Generic;

public class GetDocumentDiagnosisQuery
{
    public Guid ProjectId { get; set; }
}

public record DocumentDiagnosisDto(
    Guid ProjectId,
    int Score,
    string Summary,
    IReadOnlyList<string> MissingDocuments,
    IReadOnlyList<string> Recommendations,
    string Provider,
    DateTime GeneratedAt);
