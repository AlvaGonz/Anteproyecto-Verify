namespace Application.Abstractions.Validation;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Validations;

public interface IInternalValidationEngine
{
    Task<InternalValidationSummaryDto> RunValidationAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<InternalValidationSummaryDto?> GetLatestValidationAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Validacion?> GetLatestValidationEntityAsync(Guid projectId, CancellationToken cancellationToken = default);
}
