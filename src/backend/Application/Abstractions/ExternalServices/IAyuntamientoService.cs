namespace Application.Abstractions.ExternalServices;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Validation;

public interface IAyuntamientoService
{
    Task<AyuntamientoQueryResultDto> ConsultarLicenciasAsync(string municipio, Guid projectId, CancellationToken ct = default);
}
