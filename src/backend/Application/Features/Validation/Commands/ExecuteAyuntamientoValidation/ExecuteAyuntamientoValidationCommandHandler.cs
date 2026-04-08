namespace Application.Features.Validation.Commands.ExecuteAyuntamientoValidation;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalServices;
using Application.Abstractions.Persistence;
using Application.DTOs.Validation;
using Domain.Entities;
using Domain.Enums;

public class ExecuteAyuntamientoValidationCommandHandler
{
    private readonly IAyuntamientoService _ayuntamientoService;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IValidacionAyuntamientoRepository _validacionAyuntamientoRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ExecuteAyuntamientoValidationCommandHandler(
        IAyuntamientoService ayuntamientoService,
        IProyectoRepository proyectoRepository,
        IValidacionAyuntamientoRepository validacionAyuntamientoRepository,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork)
    {
        _ayuntamientoService = ayuntamientoService;
        _proyectoRepository = proyectoRepository;
        _validacionAyuntamientoRepository = validacionAyuntamientoRepository;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AyuntamientoQueryResultDto> Handle(ExecuteAyuntamientoValidationCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        // We assume UbicacionTexto contains the municipality or we have a specific field. For now, using UbicacionTexto.
        var municipio = project.UbicacionTexto;

        if (string.IsNullOrWhiteSpace(municipio))
        {
            return new AyuntamientoQueryResultDto { IsSuccess = false, ErrorMessage = "Municipio no especificado en el proyecto." };
        }

        var auditoriaIntento = new Auditoria(
            request.UsuarioId,
            "Consulta Ayuntamiento iniciada",
            "IntegracionExterna",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            $"Consultando municipio: {municipio}"
        );
        await _auditoriaRepository.AddAsync(auditoriaIntento, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            var response = await _ayuntamientoService.ConsultarLicenciasAsync(municipio, project.Id, cancellationToken);

            if (response.IsSuccess)
            {
                var validacion = new ValidacionAyuntamiento(
                    project.Id,
                    municipio,
                    response.Result,
                    response.Detalle,
                    DateTime.UtcNow,
                    response.DisponibilidadServicio
                );
                await _validacionAyuntamientoRepository.AddAsync(validacion, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return response;
        }
        catch (Exception ex)
        {
            var auditoriaError = new Auditoria(
                request.UsuarioId,
                "Error en consulta Ayuntamiento",
                "IntegracionExterna",
                "Proyecto",
                project.Id.ToString(),
                project.Id,
                $"Error: {ex.Message}"
            );
            await _auditoriaRepository.AddAsync(auditoriaError, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return new AyuntamientoQueryResultDto { IsSuccess = false, ErrorMessage = ex.Message };
        }
    }
}
