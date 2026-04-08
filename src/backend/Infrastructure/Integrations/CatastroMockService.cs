namespace Infrastructure.Integrations;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Integrations;
using Application.DTOs.Integrations;

public class CatastroMockService : ICatastroService
{
    public async Task<CatastroResponseDto> ConsultarParcelaAsync(string coordenadas, string designacionCatastral, CancellationToken cancellationToken = default)
    {
        await Task.Delay(500, cancellationToken);

        if (designacionCatastral?.Contains("fail", StringComparison.OrdinalIgnoreCase) == true)
        {
            return new CatastroResponseDto
            {
                IsSuccess = false,
                ErrorMessage = "Servicio de Catastro no disponible temporalmente."
            };
        }

        if (designacionCatastral?.Contains("diff", StringComparison.OrdinalIgnoreCase) == true)
        {
            return new CatastroResponseDto
            {
                IsSuccess = true,
                DesignacionCatastral = designacionCatastral,
                CoordenadasGps = "18.4861,-69.9312", // Different coordinates
                AreaMetrosCuadrados = 1200.5m, // Different area
                Limites = "Norte: Calle A, Sur: Calle B, Este: Solar 2, Oeste: Solar 4"
            };
        }

        return new CatastroResponseDto
        {
            IsSuccess = true,
            DesignacionCatastral = designacionCatastral ?? "DC-12345",
            CoordenadasGps = coordenadas ?? "18.4861,-69.9312",
            AreaMetrosCuadrados = 1500.0m,
            Limites = "Norte: Calle A, Sur: Calle B, Este: Solar 2, Oeste: Solar 4"
        };
    }
}
