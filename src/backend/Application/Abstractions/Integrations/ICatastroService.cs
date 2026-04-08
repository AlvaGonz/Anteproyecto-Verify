namespace Application.Abstractions.Integrations;

using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Integrations;

public interface ICatastroService
{
    Task<CatastroResponseDto> ConsultarParcelaAsync(string coordenadas, string designacionCatastral, CancellationToken cancellationToken = default);
}
