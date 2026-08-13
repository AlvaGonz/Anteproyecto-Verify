namespace Application.Features.Validation.Commands.CheckDuplicateExpediente;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Application.Abstractions.Persistence;
using Application.Contracts.Projects;
using Application.DTOs.Validation;
using Application.Documents.Extractions;
using Domain.Entities;
using Domain.Enums;

public class CheckDuplicateExpedienteCommandHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IDeteccionDuplicidadRepository _deteccionDuplicidadRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICatastroLookupRepository _catastroLookupRepository;

    public CheckDuplicateExpedienteCommandHandler(
        IProyectoRepository proyectoRepository,
        IDeteccionDuplicidadRepository deteccionDuplicidadRepository,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork,
        ICatastroLookupRepository catastroLookupRepository)
    {
        _proyectoRepository = proyectoRepository;
        _deteccionDuplicidadRepository = deteccionDuplicidadRepository;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
        _catastroLookupRepository = catastroLookupRepository;
    }

    private static (decimal Lat, decimal Lon)? ParseGps(string? gps)
    {
        if (string.IsNullOrWhiteSpace(gps)) return null;
        var parts = gps.Split(',');
        if (parts.Length == 2 && 
            decimal.TryParse(parts[0], out var lat) && 
            decimal.TryParse(parts[1], out var lon))
        {
            return (lat, lon);
        }
        return null;
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

        var targetMatricula = SharedFieldNormalizer.NormalizeMatricula(project.Matricula ?? "");
        var targetCatastral = SharedFieldNormalizer.NormalizeDesignacionCatastral(project.DesignacionCatastral ?? "");
        var targetCoords = ParseGps(project.UbicacionGps);

        // Check against official registry (CatastroTitulo)
        if (!string.IsNullOrEmpty(targetMatricula) || !string.IsNullOrEmpty(targetCatastral))
        {
            var catastroMatches = await _catastroLookupRepository.GetByMatriculaOrDesignacionAsync(
                string.IsNullOrEmpty(targetMatricula) ? null : targetMatricula, 
                string.IsNullOrEmpty(targetCatastral) ? null : targetCatastral, 
                cancellationToken);

            if (catastroMatches != null && catastroMatches.Any())
            {
                var match = catastroMatches.First();
                var deteccionCatastro = new DeteccionDuplicidad(
                    project.Id,
                    DuplicityRiskLevel.Critico,
                    $"Coincidencia exacta encontrada en CatastroTitulo Oficial (Matrícula: {match.Matricula}, Designación: {match.DesignacionCatastral})",
                    true,
                    null
                );
                project.SetSelladoBloqueado(true);
                await _deteccionDuplicidadRepository.AddAsync(deteccionCatastro, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                
                return new DeteccionDuplicidadDto
                {
                    Id = deteccionCatastro.Id,
                    ProyectoId = deteccionCatastro.ProyectoId,
                    ProyectoDuplicadoId = null,
                    NivelRiesgo = deteccionCatastro.NivelRiesgo,
                    DescripcionCoincidencia = deteccionCatastro.DescripcionCoincidencia,
                    FechaDeteccion = deteccionCatastro.FechaDeteccion,
                    Bloqueante = deteccionCatastro.Bloqueante
                };
            }
        }

        var allProjects = await _proyectoRepository.GetVisibleAsync(1, 500, cancellationToken);
        var potentialDuplicates = allProjects.Where(p => p.Id != project.Id).ToList();

        Proyecto? exactMatch = null;
        Proyecto? partialMatch = null;

        foreach (var p in potentialDuplicates)
        {
            var pMatricula = SharedFieldNormalizer.NormalizeMatricula(p.Matricula ?? "");
            var pCatastral = SharedFieldNormalizer.NormalizeDesignacionCatastral(p.DesignacionCatastral ?? "");
            var pCoords = ParseGps(p.UbicacionGps);

            bool sameMatricula = !string.IsNullOrEmpty(targetMatricula) && targetMatricula == pMatricula;
            bool sameCatastral = !string.IsNullOrEmpty(targetCatastral) && targetCatastral == pCatastral;
            
            bool sameCoords = false;
            if (targetCoords.HasValue && pCoords.HasValue)
            {
                var dLat = Math.Abs(targetCoords.Value.Lat - pCoords.Value.Lat);
                var dLon = Math.Abs(targetCoords.Value.Lon - pCoords.Value.Lon);
                if (dLat <= 0.00135m && dLon <= 0.00135m)
                {
                    sameCoords = true;
                }
            }

            // Fallback for exact string comparison if parser failed
            if (!sameCoords && !string.IsNullOrWhiteSpace(project.UbicacionGps) && project.UbicacionGps == p.UbicacionGps)
            {
                sameCoords = true;
            }

            if (sameMatricula && sameCatastral && sameCoords)
            {
                exactMatch = p;
                break;
            }
            else if (sameMatricula || sameCatastral || sameCoords)
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
