namespace Infrastructure.Integrations;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Integrations;
using Application.DTOs.Integrations;

public class DgriMockService : IDgriService
{
    public async Task<DgriResponseDto> ConsultarEstadoJuridicoAsync(Guid expedienteId, string datosRegistrales, CancellationToken cancellationToken = default)
    {
        // Simulate network delay
        await Task.Delay(500, cancellationToken);

        // Simulate failure if datosRegistrales contains "fail"
        if (datosRegistrales?.Contains("fail", StringComparison.OrdinalIgnoreCase) == true)
        {
            return new DgriResponseDto
            {
                IsSuccess = false,
                ErrorMessage = "Servicio DGRI no disponible temporalmente."
            };
        }

        // Simulate observations if datosRegistrales contains "obs"
        if (datosRegistrales?.Contains("obs", StringComparison.OrdinalIgnoreCase) == true)
        {
            return new DgriResponseDto
            {
                IsSuccess = true,
                Vigencia = "Vigente",
                Titularidad = "Juan Perez",
                TieneCargasJuridicas = true,
                Observaciones = "Hipoteca registrada a favor del Banco XYZ."
            };
        }

        // Simulate invalid if datosRegistrales contains "invalid"
        if (datosRegistrales?.Contains("invalid", StringComparison.OrdinalIgnoreCase) == true)
        {
            return new DgriResponseDto
            {
                IsSuccess = true,
                Vigencia = "Cancelado",
                Titularidad = "Desconocido",
                TieneCargasJuridicas = true,
                Observaciones = "Título cancelado por orden judicial."
            };
        }

        // Default success
        return new DgriResponseDto
        {
            IsSuccess = true,
            Vigencia = "Vigente",
            Titularidad = "Empresa Desarrolladora S.A.",
            TieneCargasJuridicas = false,
            Observaciones = "Sin cargas ni gravámenes."
        };
    }
}
