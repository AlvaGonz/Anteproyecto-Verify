namespace Infrastructure.ExternalServices.Catastro;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Geo;
using Domain.ValueObjects;
using Microsoft.Extensions.Options;

public class CatastroGeoServiceMock : ICatastroGeoService
{
    private readonly CatastroGeoOptions _options;

    public CatastroGeoServiceMock(IOptions<CatastroGeoOptions> options)
    {
        _options = options.Value;
    }

    public async Task<CatastroGeoResult> ValidarCoordenadasAsync(Coordenadas coordenadas, CancellationToken cancellationToken = default)
    {
        // Simulate network delay
        await Task.Delay(500, cancellationToken);

        // Mock logic: 
        // Latitudes between 17 and 20, Longitudes between -72 and -68 are roughly DR.
        bool dentroDeLimites = coordenadas.Latitud >= 17.0 && coordenadas.Latitud <= 20.0 &&
                               coordenadas.Longitud >= -72.0 && coordenadas.Longitud <= -68.0;

        if (!dentroDeLimites)
        {
            return new CatastroGeoResult
            {
                IsSuccess = true,
                DentroDeLimites = false,
                ZonaUsoSuelo = "Desconocida",
                Municipio = "Fuera de territorio nacional"
            };
        }

        // Mock zone based on coordinates (just for testing)
        string zona = (coordenadas.Latitud > 18.5) ? "Residencial" : "Comercial";
        if (coordenadas.Longitud < -70.0) zona = "Industrial";

        return new CatastroGeoResult
        {
            IsSuccess = true,
            DentroDeLimites = true,
            ZonaUsoSuelo = zona,
            Municipio = "Santo Domingo" // Mocked
        };
    }
}
