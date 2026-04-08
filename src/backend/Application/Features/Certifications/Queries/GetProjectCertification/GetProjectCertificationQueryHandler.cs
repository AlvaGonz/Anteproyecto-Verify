namespace Application.Features.Certifications.Queries.GetProjectCertification;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Certifications;

public class GetProjectCertificationQueryHandler
{
    private readonly ICertificacionRepository _certificacionRepository;

    public GetProjectCertificationQueryHandler(ICertificacionRepository certificacionRepository)
    {
        _certificacionRepository = certificacionRepository;
    }

    public async Task<CertificationDto?> HandleAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var currentCert = await _certificacionRepository.GetCurrentByProyectoIdAsync(projectId, cancellationToken);
        
        if (currentCert == null)
        {
            return null;
        }

        return new CertificationDto(
            currentCert.Id,
            currentCert.ProyectoId,
            currentCert.CodigoVerificacion,
            currentCert.EstadoCertificacion,
            currentCert.FechaEmisionUtc,
            currentCert.FechaVigenciaUtc,
            currentCert.UrlVerificacion,
            currentCert.ScoreIntegridad,
            currentCert.EstadoIntegridad,
            currentCert.Revocado,
            currentCert.MotivoRevocacion
        );
    }
}
