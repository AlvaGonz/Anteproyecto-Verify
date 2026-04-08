namespace Application.Features.Certifications.Queries.GetCertificationByCode;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Certifications;

public class GetCertificationByCodeQueryHandler
{
    private readonly ICertificacionRepository _certificacionRepository;

    public GetCertificationByCodeQueryHandler(ICertificacionRepository certificacionRepository)
    {
        _certificacionRepository = certificacionRepository;
    }

    public async Task<PublicVerificationDto?> HandleAsync(string code, CancellationToken cancellationToken = default)
    {
        var cert = await _certificacionRepository.GetByCodigoAsync(code, cancellationToken);
        
        if (cert == null)
        {
            return null;
        }

        // Solo devolver datos públicos, no exponer el expediente completo
        return new PublicVerificationDto(
            cert.Proyecto.Nombre,
            cert.Proyecto.UbicacionTexto,
            cert.CodigoVerificacion,
            cert.EstadoCertificacion,
            cert.FechaEmisionUtc,
            cert.FechaVigenciaUtc,
            cert.EstadoIntegridad
        );
    }
}
