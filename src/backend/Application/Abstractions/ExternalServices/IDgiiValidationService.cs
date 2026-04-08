namespace Application.Abstractions.ExternalServices;

using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Validation;

public interface IDgiiValidationService
{
    Task<DgiiValidationResultDto> ConsultarRncAsync(string rnc, CancellationToken ct = default);
}
