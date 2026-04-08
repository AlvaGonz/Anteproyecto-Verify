namespace Application.Abstractions.Validation;

using System;
using Domain.Enums;

public class ValidationRuleResult
{
    public string RuleCode { get; }
    public string RuleName { get; }
    public RuleStatus Status { get; }
    public string Message { get; }
    public FindingSeverity? Severity { get; }
    public Guid? RelatedDocumentId { get; }

    public ValidationRuleResult(string ruleCode, string ruleName, RuleStatus status, string message, FindingSeverity? severity = null, Guid? relatedDocumentId = null)
    {
        RuleCode = ruleCode;
        RuleName = ruleName;
        Status = status;
        Message = message;
        Severity = severity;
        RelatedDocumentId = relatedDocumentId;
    }

    public static ValidationRuleResult Pass(string ruleCode, string ruleName, string message = "Regla cumplida exitosamente.")
        => new(ruleCode, ruleName, RuleStatus.Passed, message);

    public static ValidationRuleResult Fail(string ruleCode, string ruleName, string message, FindingSeverity severity, Guid? relatedDocumentId = null)
        => new(ruleCode, ruleName, RuleStatus.Failed, message, severity, relatedDocumentId);

    public static ValidationRuleResult Warn(string ruleCode, string ruleName, string message, FindingSeverity severity, Guid? relatedDocumentId = null)
        => new(ruleCode, ruleName, RuleStatus.Warning, message, severity, relatedDocumentId);

    public static ValidationRuleResult Skip(string ruleCode, string ruleName, string message = "Regla no aplicable.")
        => new(ruleCode, ruleName, RuleStatus.NotApplicable, message);
}
