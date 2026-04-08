namespace Application.Abstractions.Integrations;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Integrations;

public interface IDgriService
{
    Task<DgriResponseDto> ConsultarEstadoJuridicoAsync(Guid expedienteId, string datosRegistrales, CancellationToken cancellationToken = default);
}
