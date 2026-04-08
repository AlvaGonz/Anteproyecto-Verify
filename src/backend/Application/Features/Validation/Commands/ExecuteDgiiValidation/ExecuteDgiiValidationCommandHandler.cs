namespace Application.Features.Validation.Commands.ExecuteDgiiValidation;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.ExternalServices;
using Application.Abstractions.Persistence;
using Application.DTOs.Validation;
using Domain.Entities;
using Domain.Enums;

public class ExecuteDgiiValidationCommandHandler
{
    private readonly IDgiiValidationService _dgiiService;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IValidacionDgiiRepository _validacionDgiiRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ExecuteDgiiValidationCommandHandler(
        IDgiiValidationService dgiiService,
        IProyectoRepository proyectoRepository,
        IValidacionDgiiRepository validacionDgiiRepository,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork)
    {
        _dgiiService = dgiiService;
        _proyectoRepository = proyectoRepository;
        _validacionDgiiRepository = validacionDgiiRepository;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DgiiValidationResultDto> Handle(ExecuteDgiiValidationCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        if (string.IsNullOrWhiteSpace(project.RncDesarrollador))
        {
            return new DgiiValidationResultDto { IsSuccess = false, ErrorMessage = "RNC no especificado en el proyecto." };
        }

        var auditoriaIntento = new Auditoria(
            request.UsuarioId,
            "Consulta DGII iniciada",
            "IntegracionExterna",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            $"Consultando RNC: {project.RncDesarrollador}"
        );
        await _auditoriaRepository.AddAsync(auditoriaIntento, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            var response = await _dgiiService.ConsultarRncAsync(project.RncDesarrollador, cancellationToken);

            if (response.IsSuccess)
            {
                var validacion = new ValidacionDgii(
                    project.Id,
                    response.Rnc,
                    response.Status,
                    response.TieneDeudas,
                    DateTime.UtcNow,
                    response.ErrorMessage,
                    "DGII_API"
                );
                await _validacionDgiiRepository.AddAsync(validacion, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return response;
        }
        catch (Exception ex)
        {
            var auditoriaError = new Auditoria(
                request.UsuarioId,
                "Error en consulta DGII",
                "IntegracionExterna",
                "Proyecto",
                project.Id.ToString(),
                project.Id,
                $"Error: {ex.Message}"
            );
            await _auditoriaRepository.AddAsync(auditoriaError, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return new DgiiValidationResultDto { IsSuccess = false, ErrorMessage = ex.Message };
        }
    }
}
