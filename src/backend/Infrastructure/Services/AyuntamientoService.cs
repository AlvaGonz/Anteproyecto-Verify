namespace Infrastructure.Services;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalServices;
using Application.DTOs.Validation;
using Domain.Enums;

public class AyuntamientoService : IAyuntamientoService
{
    public async Task<AyuntamientoQueryResultDto> ConsultarLicenciasAsync(string municipio, Guid projectId, CancellationToken ct = default)
    {
        // Mock implementation
        await Task.Delay(500, ct);

        if (municipio.Contains("Santo Domingo", StringComparison.OrdinalIgnoreCase))
        {
            return new AyuntamientoQueryResultDto
            {
                IsSuccess = true,
                Result = AyuntamientoValidationResult.Verificado,
                Detalle = "Licencia de uso de suelo aprobada.",
                DisponibilidadServicio = true
            };
        }

        if (municipio.Contains("Santiago", StringComparison.OrdinalIgnoreCase))
        {
            return new AyuntamientoQueryResultDto
            {
                IsSuccess = true,
                Result = AyuntamientoValidationResult.ConObservaciones,
                Detalle = "Licencia denegada por zonificación.",
                DisponibilidadServicio = true
            };
        }

        return new AyuntamientoQueryResultDto
        {
            IsSuccess = true,
            Result = AyuntamientoValidationResult.PendienteVerificacionManual,
            Detalle = "Trámite en proceso.",
            DisponibilidadServicio = true
        };
    }
}
