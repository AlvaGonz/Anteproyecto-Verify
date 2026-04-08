namespace Application.DTOs.Certifications;

using System;
using Domain.Enums;

public record CertificationDto(
    Guid Id,
    Guid ProyectoId,
    string CodigoVerificacion,
    CertificationStatus EstadoCertificacion,
    DateTime FechaEmisionUtc,
    DateTime? FechaVigenciaUtc,
    string UrlVerificacion,
    int? ScoreIntegridad,
    IntegrityStatus EstadoIntegridad,
    bool Revocado,
    string? MotivoRevocacion
);
