namespace Infrastructure.Services.Crypto;

using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Services.Crypto;

public class MockFirmaDigitalService : IFirmaDigitalService
{
    public Task<string> FirmarDatosAsync(string datos, CancellationToken cancellationToken = default)
    {
        // Mock implementation using SHA256 for demonstration
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(datos + "MOCK_PRIVATE_KEY");
        var hash = sha256.ComputeHash(bytes);
        return Task.FromResult(Convert.ToBase64String(hash));
    }

    public Task<bool> VerificarFirmaAsync(string datos, string firma, CancellationToken cancellationToken = default)
    {
        // Mock verification
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(datos + "MOCK_PRIVATE_KEY");
        var hash = sha256.ComputeHash(bytes);
        var expectedFirma = Convert.ToBase64String(hash);
        
        return Task.FromResult(firma == expectedFirma);
    }
}

public class MockQrGeneratorService : IQrGeneratorService
{
    public Task<string> GenerarQrUrlAsync(string contenido, CancellationToken cancellationToken = default)
    {
        // Mock implementation returning a dummy URL
        var encodedContent = Uri.EscapeDataString(contenido);
        return Task.FromResult($"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={encodedContent}");
    }
}
