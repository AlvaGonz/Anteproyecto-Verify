namespace Application.DTOs.ExternalValidation;

using System;
using System.Collections.Generic;

public record ExternalValidationResult(
    ExternalProviderType Provider,
    ExternalValidationStatus Status,
    bool IsMatch,
    string Summary,
    List<string> Findings,
    DateTime CheckedAtUtc,
    string? ReferenceCode,
    object? RawPayload = null // For debugging or specific future needs
);
