namespace Application.Features.Certifications.Commands.IssueCertification;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Certifications;
using Application.Abstractions.Persistence;
using Application.DTOs.Certifications;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Configuration;

public class IssueCertificationCommandHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly ICertificacionRepository _certificacionRepository;
    private readonly IReporteRepository _reporteRepository;
    private readonly ICertificationCodeGenerator _codeGenerator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _publicPortalBaseUrl;

    public IssueCertificationCommandHandler(
        IProyectoRepository proyectoRepository,
        ICertificacionRepository certificacionRepository,
        IReporteRepository reporteRepository,
        ICertificationCodeGenerator codeGenerator,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _proyectoRepository = proyectoRepository;
        _certificacionRepository = certificacionRepository;
        _reporteRepository = reporteRepository;
        _codeGenerator = codeGenerator;
        _unitOfWork = unitOfWork;
        
        // Asumimos que la URL base del portal público está en la configuración
        _publicPortalBaseUrl = configuration["PublicPortalBaseUrl"] ?? "http://localhost:3000";
    }

    public async Task<CertificationDto> HandleAsync(Guid projectId, Guid userId, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(projectId, cancellationToken);
        if (proyecto == null)
        {
            throw new KeyNotFoundException($"Proyecto con ID {projectId} no encontrado.");
        }

        // Regla de negocio: solo emitir si tiene validación completa (estado InReview o superior)
        // O si tiene un reporte generado
        var reportes = await _reporteRepository.GetByProyectoIdAsync(projectId, cancellationToken);
        var latestReport = reportes.OrderByDescending(r => r.CreatedAtUtc).FirstOrDefault();

        if (latestReport == null)
        {
            throw new InvalidOperationException("No se puede emitir certificación: el proyecto no tiene una validación completa.");
        }

        // Regla de negocio: si IntegrityStatus es Rojo, no emitir automáticamente
        if (proyecto.EstadoIntegridad == IntegrityStatus.Critical)
        {
            throw new InvalidOperationException("No se puede emitir certificación: el proyecto tiene un estado de integridad Crítico (Rojo).");
        }

        // Revocar certificación anterior si existe
        var currentCert = await _certificacionRepository.GetCurrentByProyectoIdAsync(projectId, cancellationToken);
        if (currentCert != null)
        {
            currentCert.Revoke("Regeneración de código");
            _certificacionRepository.Update(currentCert);
        }

        // Generar nuevo código y URL
        var code = _codeGenerator.GenerateCode();
        var url = $"{_publicPortalBaseUrl.TrimEnd('/')}/verify/{code}";

        // Crear nueva certificación
        var newCert = new Certificacion(
            projectId,
            latestReport.Id,
            code,
            url,
            null, // ScoreIntegridad (podría extraerse del reporte si se guarda allí)
            proyecto.EstadoIntegridad,
            userId,
            (currentCert?.Version ?? 0) + 1
        );

        await _certificacionRepository.AddAsync(newCert, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CertificationDto(
            newCert.Id,
            newCert.ProyectoId,
            newCert.CodigoVerificacion,
            newCert.EstadoCertificacion,
            newCert.FechaEmisionUtc,
            newCert.FechaVigenciaUtc,
            newCert.UrlVerificacion,
            newCert.ScoreIntegridad,
            newCert.EstadoIntegridad,
            newCert.Revocado,
            newCert.MotivoRevocacion
        );
    }
}
