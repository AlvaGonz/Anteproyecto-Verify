namespace Application.DTOs.Validation;

using System;
using System.Collections.Generic;

public record ValidationSourceResult(
    string SourceName,
    string Status,
    bool IsSuccess,
    bool IsMatch,
    string Summary,
    List<string> Findings,
    DateTime TimestampUtc,
    string? ReferenceCode,
    string? ErrorMessage = null
);
