namespace Application.Features.PublicVerification.Queries.GetPublicProjectVerification;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Public;
using Domain.Enums;

public class GetPublicProjectVerificationQueryHandler
{
    private readonly ICertificacionRepository _certificacionRepository;

    public GetPublicProjectVerificationQueryHandler(ICertificacionRepository certificacionRepository)
    {
        _certificacionRepository = certificacionRepository;
    }

    public async Task<PublicProjectVerificationDto?> HandleAsync(string code, CancellationToken cancellationToken = default)
    {
        var cert = await _certificacionRepository.GetByCodigoAsync(code, cancellationToken);
        
        if (cert == null)
        {
            return null;
        }

        bool isVerifiable = cert.EstadoCertificacion == CertificationStatus.Emitido || 
                            cert.EstadoCertificacion == CertificationStatus.Vigente;

        string verificationMessage = isVerifiable 
            ? "El proyecto cuenta con una certificación válida y verificable." 
            : (cert.EstadoCertificacion == CertificationStatus.Revocado 
                ? "La certificación asociada a este código ha sido revocada." 
                : "La certificación asociada a este código ha expirado o no es válida.");

        string integrityStatusStr = cert.EstadoIntegridad switch
        {
            IntegrityStatus.Valid => "Consistente",
            IntegrityStatus.Warning => "Con Observaciones",
            IntegrityStatus.Critical => "Inconsistente",
            _ => "Pendiente"
        };

        string projectStatusStr = cert.Proyecto.Estado?.Nombre ?? "Desconocido";

        return new PublicProjectVerificationDto(
            PublicCode: cert.CodigoVerificacion,
            ProjectName: cert.Proyecto.Nombre,
            PublicLocation: cert.Proyecto.UbicacionTexto,
            PublicProjectStatus: projectStatusStr,
            IntegrityStatus: integrityStatusStr,
            VerificationMessage: verificationMessage,
            LastVerifiedUtc: cert.FechaEmisionUtc,
            IsVerifiable: isVerifiable,
            Summary: "Validación institucional completada. Los datos mostrados son un resumen público del estado del proyecto."
        );
    }
}
