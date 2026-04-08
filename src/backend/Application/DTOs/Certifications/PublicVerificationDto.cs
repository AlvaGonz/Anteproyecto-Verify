namespace Application.DTOs.Certifications;

using System;
using Domain.Enums;

public record PublicVerificationDto(
    string NombreProyecto,
    string Ubicacion,
    string CodigoVerificacion,
    CertificationStatus EstadoCertificacion,
    DateTime FechaEmisionUtc,
    DateTime? FechaVigenciaUtc,
    IntegrityStatus EstadoIntegridad
);
