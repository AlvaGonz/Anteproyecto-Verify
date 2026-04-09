namespace Application.Abstractions.ExternalServices.Credit;

using System.Threading;
using System.Threading.Tasks;
using Domain.Enums;

public class TransUnionResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    
    public int Score { get; set; }
    public decimal PorcentajeEndeudamiento { get; set; }
    public int AtrasosUltimos12Meses { get; set; }
    public NivelRiesgoCrediticio NivelRiesgo { get; set; }
}

public interface ITransUnionService
{
    Task<TransUnionResult> ConsultarHistorialAsync(string identificacion, CancellationToken cancellationToken = default);
}
