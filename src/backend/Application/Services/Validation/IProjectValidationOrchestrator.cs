namespace Application.Services.Validation;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Validation;

public interface IProjectValidationOrchestrator
{
    Task<ValidationExecutionResult> RunFullValidationAsync(Guid projectId, Guid? userId = null, CancellationToken cancellationToken = default);
    Task<ValidationExecutionResult?> GetLatestValidationResultAsync(Guid projectId, CancellationToken cancellationToken = default);
}
