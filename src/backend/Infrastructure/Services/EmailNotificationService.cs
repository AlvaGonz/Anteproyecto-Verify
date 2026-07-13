namespace Infrastructure.Services;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Notifications;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Logging;

public class EmailNotificationService : IEmailNotificationService
{
    private readonly IEmailService _emailService;
    private readonly IAuditLogger _auditLogger;
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(
        IEmailService emailService,
        IAuditLogger auditLogger,
        ILogger<EmailNotificationService> logger)
    {
        _emailService = emailService;
        _auditLogger = auditLogger;
        _logger = logger;
    }

    public async Task SendCriticalAlertAsync(string recipientEmail, AlertaValidacion alerta, CancellationToken ct = default)
    {
        // Mock implementation
        await Task.Delay(100, ct);
        _logger.LogInformation("Sending critical alert email to {Email} for Alert {AlertId}: {Titulo}", recipientEmail, alerta.Id, alerta.Titulo);
    }

    public async Task SendProjectStatusChangeAsync(string recipientEmail, Proyecto proyecto, CancellationToken ct = default)
    {
        string subject = $"Actualización de Estado: Proyecto {proyecto.Nombre}";
        string statusStr = proyecto.Status switch
        {
            ProjectStatus.Approved => "Aprobado (Verificado)",
            ProjectStatus.Rejected => "Rechazado",
            _ => proyecto.Status.ToString()
        };

        bool isApproved = proyecto.Status == ProjectStatus.Approved;
        
        string body = Email.EmailTemplates.GetProjectStatusChangeEmail(
            proyecto.Nombre,
            proyecto.Id.ToString(),
            statusStr,
            isApproved
        );

        try
        {
            await _emailService.SendEmailAsync(recipientEmail, subject, body, "VeriFinca <notificaciones@handymansolutionrd.lat>", ct);

            await _auditLogger.AppendAsync(new AuditEntryDto
            {
                UsuarioId = null, // System action
                TipoOperacion = TipoOperacion.EmailEnviado,
                Accion = "Envío de Notificación de Estado",
                Resultado = $"Email enviado a {recipientEmail} sobre el proyecto {proyecto.Id}",
                ReferenciaExpedienteId = proyecto.Id
            }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {Email}", recipientEmail);

            await _auditLogger.AppendAsync(new AuditEntryDto
            {
                UsuarioId = null, // System action
                TipoOperacion = TipoOperacion.EmailFallido,
                Accion = "Envío de Notificación de Estado",
                Resultado = $"Fallo al enviar email a {recipientEmail}: {ex.Message}",
                ReferenciaExpedienteId = proyecto.Id
            }, ct);
        }
    }
}
