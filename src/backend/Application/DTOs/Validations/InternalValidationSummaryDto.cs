namespace Application.DTOs.Validations;

using System;
using System.Collections.Generic;
using Domain.Enums;

public record InternalValidationSummaryDto(
    Guid ValidacionId,
    Guid ProyectoId,
    ValidationStatus Status,
    bool? EsLegitimo,
    int PassedCount,
    int WarningCount,
    int FailedCount,
    DateTime CreatedAtUtc,
    IEnumerable<ValidationRuleResultDto> Results
);

public record ValidationRuleResultDto(
    Guid Id,
    string RuleCode,
    string RuleName,
    RuleStatus Status,
    string Message,
    FindingSeverity? Severity,
    Guid? RelatedDocumentId
);
