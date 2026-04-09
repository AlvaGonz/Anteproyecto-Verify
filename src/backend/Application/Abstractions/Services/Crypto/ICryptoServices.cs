namespace Application.Abstractions.Services.Crypto;

using System;
using System.Threading;
using System.Threading.Tasks;

public interface IFirmaDigitalService
{
    Task<string> FirmarDatosAsync(string datos, CancellationToken cancellationToken = default);
    Task<bool> VerificarFirmaAsync(string datos, string firma, CancellationToken cancellationToken = default);
}

public interface IQrGeneratorService
{
    Task<string> GenerarQrUrlAsync(string contenido, CancellationToken cancellationToken = default);
}
