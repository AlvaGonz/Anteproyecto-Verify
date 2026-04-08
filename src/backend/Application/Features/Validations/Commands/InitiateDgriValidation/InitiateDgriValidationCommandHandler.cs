namespace Application.Features.Validations.Commands.InitiateDgriValidation;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Integrations;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Domain.Enums;

public class InitiateDgriValidationCommandHandler
{
    private readonly IDgriService _dgriService;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IValidacionRepository _validacionRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public InitiateDgriValidationCommandHandler(
        IDgriService dgriService,
        IProyectoRepository proyectoRepository,
        IValidacionRepository validacionRepository,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork)
    {
        _dgriService = dgriService;
        _proyectoRepository = proyectoRepository;
        _validacionRepository = validacionRepository;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(InitiateDgriValidationCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        // RS10: Registrar el intento de consulta en auditoría con timestamp
        var auditoriaIntento = new Auditoria(
            request.UsuarioId,
            "Consulta DGRI iniciada",
            "IntegracionExterna",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            $"Consultando datos registrales: {request.DatosRegistrales}"
        );
        await _auditoriaRepository.AddAsync(auditoriaIntento, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // RS10: Enviar solicitud al servicio DGRI (NO bloquear si falla)
        try
        {
            var response = await _dgriService.ConsultarEstadoJuridicoAsync(project.Id, request.DatosRegistrales, cancellationToken);

            // RS11: Registrar respuesta del servicio DGRI
            var validacion = new Validacion(project.Id, "DGRI");
            
            string detalle = $"Vigencia: {response.Vigencia}, Titularidad: {response.Titularidad}, Cargas: {(response.TieneCargasJuridicas ? "Sí" : "No")}. {response.Observaciones}";
            
            validacion.CompleteValidation(
                response.IsSuccess && !response.TieneCargasJuridicas && response.Vigencia == "Vigente",
                response.IsSuccess ? detalle : $"Error DGRI: {response.ErrorMessage}"
            );
            
            await _validacionRepository.AddAsync(validacion, cancellationToken);

            // RS12: Marcar estado jurídico del título
            if (response.IsSuccess)
            {
                EstadoJuridico nuevoEstado;
                if (response.Vigencia == "Vigente" && !response.TieneCargasJuridicas)
                {
                    nuevoEstado = EstadoJuridico.Valido;
                }
                else if (response.Vigencia == "Vigente" && response.TieneCargasJuridicas)
                {
                    nuevoEstado = EstadoJuridico.ConObservaciones;
                }
                else
                {
                    nuevoEstado = EstadoJuridico.Invalido;
                }

                project.UpdateEstadoJuridico(nuevoEstado);
                _proyectoRepository.Update(project);

                // Notificar auditoría del cambio de estado
                var auditoriaEstado = new Auditoria(
                    request.UsuarioId,
                    "Estado Jurídico Actualizado",
                    "CambioEstado",
                    "Proyecto",
                    project.Id.ToString(),
                    project.Id,
                    $"Nuevo estado jurídico: {nuevoEstado}"
                );
                await _auditoriaRepository.AddAsync(auditoriaEstado, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return response.IsSuccess;
        }
        catch (Exception ex)
        {
            // RS10: NO bloquear el sistema si el servicio externo no responde
            var auditoriaError = new Auditoria(
                request.UsuarioId,
                "Error en consulta DGRI",
                "IntegracionExterna",
                "Proyecto",
                project.Id.ToString(),
                project.Id,
                $"Error: {ex.Message}"
            );
            await _auditoriaRepository.AddAsync(auditoriaError, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return false;
        }
    }
}
