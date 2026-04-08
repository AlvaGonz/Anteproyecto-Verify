namespace Infrastructure.Services;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalServices;
using Application.DTOs.Validation;
using Domain.Enums;

public class DgiiValidationService : IDgiiValidationService
{
    public async Task<DgiiValidationResultDto> ConsultarRncAsync(string rnc, CancellationToken ct = default)
    {
        // Mock implementation
        await Task.Delay(500, ct);

        if (rnc == "123456789")
        {
            return new DgiiValidationResultDto
            {
                IsSuccess = true,
                Rnc = rnc,
                RazonSocial = "Empresa de Prueba SRL",
                Status = DgiiStatus.Activo,
                TieneDeudas = false
            };
        }

        if (rnc == "987654321")
        {
            return new DgiiValidationResultDto
            {
                IsSuccess = true,
                Rnc = rnc,
                RazonSocial = "Empresa Inactiva SRL",
                Status = DgiiStatus.Inactivo,
                TieneDeudas = true
            };
        }

        return new DgiiValidationResultDto
        {
            IsSuccess = false,
            ErrorMessage = "RNC no encontrado en la base de datos de la DGII."
        };
    }
}
