namespace Application.Features.Validation.Commands.EvaluateDocumentFormality;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Application.DTOs.Validation;
using Domain.Entities;
using Domain.Enums;

public class EvaluateDocumentFormalityCommandHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IDocumentoRepository _documentoRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationFactory _notificationFactory;
    private readonly INotificacionRepository _notificacionRepository;

    public EvaluateDocumentFormalityCommandHandler(
        IProyectoRepository proyectoRepository,
        IDocumentoRepository documentoRepository,
        IAuditoriaRepository auditoriaRepository,
        IUnitOfWork unitOfWork,
        INotificationFactory notificationFactory,
        INotificacionRepository notificacionRepository)
    {
        _proyectoRepository = proyectoRepository;
        _documentoRepository = documentoRepository;
        _auditoriaRepository = auditoriaRepository;
        _unitOfWork = unitOfWork;
        _notificationFactory = notificationFactory;
        _notificacionRepository = notificacionRepository;
    }

    public async Task<List<DocumentFormalEvaluationDto>> Handle(EvaluateDocumentFormalityCommand request, CancellationToken cancellationToken)
    {
        var project = await _proyectoRepository.GetByIdAsync(request.ProyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {request.ProyectoId} no encontrado.");

        var documents = await _documentoRepository.GetByProyectoIdAsync(request.ProyectoId, cancellationToken);
        var results = new List<DocumentFormalEvaluationDto>();

        foreach (var doc in documents)
        {
            DocumentFormalStatus status = DocumentFormalStatus.Vigente;
            DateTime? fechaVencimiento = null;
            string versionRegla = "v1.0";

            if (doc.FechaEmision.HasValue)
            {
                fechaVencimiento = doc.FechaEmision.Value.AddYears(1);
                if (fechaVencimiento < DateTime.UtcNow)
                {
                    status = DocumentFormalStatus.Vencido;
                }
            }
            else
            {
                status = DocumentFormalStatus.Incompleto;
            }

            if (string.IsNullOrWhiteSpace(doc.InstitucionEmisora))
            {
                status = DocumentFormalStatus.Incompleto;
            }

            doc.UpdateFormalStatus(status, fechaVencimiento, versionRegla);
            _documentoRepository.Update(doc);

            var tipoNotif = status == DocumentFormalStatus.Vigente
                ? TipoNotificacionId.DocumentoValidado
                : TipoNotificacionId.DocumentoRechazado;

            var mensaje = status == DocumentFormalStatus.Vigente
                ? $"Documento \"{doc.TipoDocumento}\" validado exitosamente en \"{project.Nombre}\"."
                : $"Documento \"{doc.TipoDocumento}\" requiere atención en \"{project.Nombre}\".";

            var notif = await _notificationFactory.CreateAsync(request.UsuarioId,
                tipoNotif, mensaje,
                $"/admin/projects/{project.Id}/documents",
                project.Id, "Proyecto", cancellationToken);
            await _notificacionRepository.AddAsync(notif, cancellationToken);

            results.Add(new DocumentFormalEvaluationDto
            {
                DocumentoId = doc.Id,
                FormalStatus = status,
                FechaVencimiento = fechaVencimiento,
                VersionReglaAplicada = versionRegla,
                FechaEvaluacion = DateTime.UtcNow
            });
        }

        var auditoria = new Auditoria(
            request.UsuarioId,
            "Evaluación formal de documentos completada",
            "ValidacionInterna",
            "Proyecto",
            project.Id.ToString(),
            project.Id,
            $"Se evaluaron {documents.Count()} documentos"
        );
        await _auditoriaRepository.AddAsync(auditoria, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return results;
    }
}
