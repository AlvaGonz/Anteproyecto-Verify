namespace Application.DTOs.Validation;

using System;
using System.Collections.Generic;
using Application.DTOs.Validations;

public record ValidationExecutionResult(
    Guid ProjectId,
    Guid ExecutionId,
    DateTime StartedAtUtc,
    DateTime CompletedAtUtc,
    ValidationExecutionStatus OverallStatus,
    bool IsFullyValid,
    InternalValidationSummaryDto? InternalValidation,
    List<ValidationSourceResult> ExternalSources,
    List<string> Errors
);
