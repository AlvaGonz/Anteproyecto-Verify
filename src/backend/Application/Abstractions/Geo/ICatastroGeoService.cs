namespace Application.Abstractions.Geo;

using System.Threading;
using System.Threading.Tasks;
using Domain.ValueObjects;

public class CatastroGeoResult
{
    public bool IsSuccess { get; set; }
    public bool DentroDeLimites { get; set; }
    public string? ZonaUsoSuelo { get; set; }
    public string? Municipio { get; set; }
    public string? ErrorMessage { get; set; }
}

public interface ICatastroGeoService
{
    Task<CatastroGeoResult> ValidarCoordenadasAsync(Coordenadas coordenadas, CancellationToken cancellationToken = default);
}
