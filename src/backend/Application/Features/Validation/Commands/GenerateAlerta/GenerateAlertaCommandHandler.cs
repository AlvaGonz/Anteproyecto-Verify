namespace Application.Features.Validation.Commands.GenerateAlerta;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Application.DTOs.Validation;
using Domain.Entities;
using Domain.Enums;

public class GenerateAlertaCommandHandler
{
    private readonly IAlertaValidacionRepository _alertaRepository;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IEmailNotificationService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public GenerateAlertaCommandHandler(
        IAlertaValidacionRepository alertaRepository,
        IProyectoRepository proyectoRepository,
        IEmailNotificationService emailService,
        IUnitOfWork unitOfWork)
    {
        _alertaRepository = alertaRepository;
        _proyectoRepository = proyectoRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<AlertaValidacionDto> Handle(GenerateAlertaCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        var alerta = new AlertaValidacion(
            request.ProyectoId,
            request.Type,
            request.Category,
            request.Titulo,
            request.Descripcion,
            request.NivelRiesgo,
            request.DocumentoId,
            request.Recomendacion
        );

        await _alertaRepository.AddAsync(alerta, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (alerta.Type == AlertType.Critica)
        {
            // Assuming we send it to the project creator or a configured admin email
            var recipientEmail = project.UsuarioCreador?.Email ?? "admin@verifinca.com";
            await _emailService.SendCriticalAlertAsync(recipientEmail, alerta, cancellationToken);
        }

        return new AlertaValidacionDto
        {
            Id = alerta.Id,
            ProyectoId = alerta.ProyectoId,
            DocumentoId = alerta.DocumentoId,
            Type = alerta.Type,
            Category = alerta.Category,
            Titulo = alerta.Titulo,
            Descripcion = alerta.Descripcion,
            Recomendacion = alerta.Recomendacion,
            Resuelta = alerta.Resuelta,
            FechaGeneracion = alerta.FechaGeneracion,
            NivelRiesgo = alerta.NivelRiesgo
        };
    }
}
