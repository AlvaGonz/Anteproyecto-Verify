namespace Application.Abstractions.ExternalValidation;

using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.ExternalValidation;

public interface IExternalValidationProvider
{
    ExternalProviderType ProviderType { get; }
    Task<ExternalValidationResult> ValidateAsync(ExternalValidationRequest request, CancellationToken cancellationToken = default);
}
