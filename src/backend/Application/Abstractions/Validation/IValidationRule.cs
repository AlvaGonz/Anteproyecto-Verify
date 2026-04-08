namespace Application.Abstractions.Validation;

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

public interface IValidationRule
{
    string RuleCode { get; }
    string RuleName { get; }
    Task<IEnumerable<ValidationRuleResult>> EvaluateAsync(ValidationRuleContext context, CancellationToken cancellationToken = default);
}
