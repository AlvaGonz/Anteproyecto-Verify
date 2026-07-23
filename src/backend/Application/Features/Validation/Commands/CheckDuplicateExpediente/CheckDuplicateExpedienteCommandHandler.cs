namespace Application.Features.Validation.Commands.CheckDuplicateExpediente;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.DTOs.Validation;
using Domain.Entities;
using Domain.Enums;

public class CheckDuplicateExpedienteCommandHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IDeteccionDuplicidadRepository _deteccionDuplicidadRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CheckDuplicateExpedienteCommandHandler(
        IProyectoRepository proyectoRepository,
        IDeteccionDuplicidadRepository deteccionDuplicidadRepository,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork)
    {
        _proyectoRepository = proyectoRepository;
        _deteccionDuplicidadRepository = deteccionDuplicidadRepository;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeteccionDuplicidadDto> Handle(CheckDuplicateExpedienteCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        var auditoriaIntento = new Auditoria(
            request.UsuarioId,
            "Detección de duplicidad iniciada",
            "ValidacionInterna",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            "Buscando expedientes duplicados"
        );
        await _auditoriaRepository.AddAsync(auditoriaIntento, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Basic duplicate detection logic
        // In a real scenario, this would be a more complex query or call to a specialized service
        var allProjects = await _proyectoRepository.GetVisibleAsync(1, 500, cancellationToken);
        var potentialDuplicates = allProjects.Where(p => p.Id != project.Id).ToList();

        Proyecto? exactMatch = null;
        Proyecto? partialMatch = null;

        foreach (var p in potentialDuplicates)
        {
            bool sameMatricula = !string.IsNullOrWhiteSpace(project.Matricula) && project.Matricula == p.Matricula;
            bool sameCatastral = !string.IsNullOrWhiteSpace(project.DesignacionCatastral) && project.DesignacionCatastral == p.DesignacionCatastral;
            bool sameCoords = !string.IsNullOrWhiteSpace(project.UbicacionGps) && project.UbicacionGps == p.UbicacionGps;

            if (sameMatricula && sameCatastral && sameCoords)
            {
                exactMatch = p;
                break;
            }
            else if ((sameMatricula && sameCatastral) || (sameMatricula && sameCoords) || (sameCatastral && sameCoords))
            {
                partialMatch = p;
            }
        }

        DeteccionDuplicidad deteccion;
        if (exactMatch != null)
        {
            deteccion = new DeteccionDuplicidad(
                project.Id,
                DuplicityRiskLevel.Critico,
                $"Coincidencia exacta encontrada con proyecto {exactMatch.CodigoInterno}",
                true,
                exactMatch.Id
            );
            project.SetSelladoBloqueado(true);
        }
        else if (partialMatch != null)
        {
            deteccion = new DeteccionDuplicidad(
                project.Id,
                DuplicityRiskLevel.Alto,
                $"Coincidencia parcial encontrada con proyecto {partialMatch.CodigoInterno}",
                false,
                partialMatch.Id
            );
        }
        else
        {
            deteccion = new DeteccionDuplicidad(
                project.Id,
                DuplicityRiskLevel.Ninguno,
                "No se encontraron duplicados",
                false
            );
        }

        await _deteccionDuplicidadRepository.AddAsync(deteccion, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new DeteccionDuplicidadDto
        {
            Id = deteccion.Id,
            ProyectoId = deteccion.ProyectoId,
            ProyectoDuplicadoId = deteccion.ProyectoDuplicadoId,
            NivelRiesgo = deteccion.NivelRiesgo,
            DescripcionCoincidencia = deteccion.DescripcionCoincidencia,
            FechaDeteccion = deteccion.FechaDeteccion,
            Bloqueante = deteccion.Bloqueante
        };
    }
}
