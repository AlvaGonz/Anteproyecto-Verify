namespace Infrastructure.ExternalServices.Credit;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalServices.Credit;
using Domain.Enums;
using Microsoft.Extensions.Options;

public class TransUnionServiceMock : ITransUnionService
{
    private readonly TransUnionOptions _options;

    public TransUnionServiceMock(IOptions<TransUnionOptions> options)
    {
        _options = options.Value;
    }

    public async Task<TransUnionResult> ConsultarHistorialAsync(string identificacion, CancellationToken cancellationToken = default)
    {
        // Simulate network delay
        await Task.Delay(800, cancellationToken);

        // Mock logic based on last digit of identification
        if (string.IsNullOrWhiteSpace(identificacion))
        {
            return new TransUnionResult { IsSuccess = false, ErrorMessage = "Identificación inválida." };
        }

        char lastChar = identificacion[^1];
        
        if (lastChar == '9')
        {
            return new TransUnionResult
            {
                IsSuccess = true,
                Score = 550,
                PorcentajeEndeudamiento = 65.5m,
                AtrasosUltimos12Meses = 4,
                NivelRiesgo = NivelRiesgoCrediticio.Critico
            };
        }
        else if (lastChar == '8' || lastChar == '7')
        {
            return new TransUnionResult
            {
                IsSuccess = true,
                Score = 620,
                PorcentajeEndeudamiento = 45.0m,
                AtrasosUltimos12Meses = 2,
                NivelRiesgo = NivelRiesgoCrediticio.Alto
            };
        }
        else if (lastChar == '6' || lastChar == '5' || lastChar == '4')
        {
            return new TransUnionResult
            {
                IsSuccess = true,
                Score = 710,
                PorcentajeEndeudamiento = 30.0m,
                AtrasosUltimos12Meses = 0,
                NivelRiesgo = NivelRiesgoCrediticio.Medio
            };
        }

        // Default good score
        return new TransUnionResult
        {
            IsSuccess = true,
            Score = 800,
            PorcentajeEndeudamiento = 15.0m,
            AtrasosUltimos12Meses = 0,
            NivelRiesgo = NivelRiesgoCrediticio.Bajo
        };
    }
}
