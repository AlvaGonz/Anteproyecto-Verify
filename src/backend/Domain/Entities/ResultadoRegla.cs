namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class ResultadoRegla : EntityBase
{
    public Guid ValidacionId { get; private set; }
    public Validacion Validacion { get; private set; } = null!;

    public string RuleCode { get; private set; } = null!;
    public string RuleName { get; private set; } = null!;
    public RuleStatus Status { get; private set; }
    public string Message { get; private set; } = null!;
    public FindingSeverity? Severity { get; private set; }
    public Guid? RelatedDocumentId { get; private set; }

    private ResultadoRegla() { } // For EF Core

    public ResultadoRegla(Guid validacionId, string ruleCode, string ruleName, RuleStatus status, string message, FindingSeverity? severity = null, Guid? relatedDocumentId = null)
    {
        if (validacionId == Guid.Empty) throw new ArgumentException("ValidacionId requerido", nameof(validacionId));
        if (string.IsNullOrWhiteSpace(ruleCode)) throw new ArgumentException("RuleCode requerido", nameof(ruleCode));
        if (string.IsNullOrWhiteSpace(ruleName)) throw new ArgumentException("RuleName requerido", nameof(ruleName));

        ValidacionId = validacionId;
        RuleCode = ruleCode;
        RuleName = ruleName;
        Status = status;
        Message = message;
        Severity = severity;
        RelatedDocumentId = relatedDocumentId;
    }
}
