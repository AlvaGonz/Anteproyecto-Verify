namespace Application.Features.ReglasValidacion.Commands.ToggleRuleStatus;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Enums;

public class ToggleRuleStatusCommandHandler
{
    private readonly IReglaValidacionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _auditLogger;

    public ToggleRuleStatusCommandHandler(
        IReglaValidacionRepository repository,
        IUnitOfWork unitOfWork,
        IAuditLogger auditLogger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _auditLogger = auditLogger;
    }

    public async Task<bool> Handle(ToggleRuleStatusCommand request, CancellationToken cancellationToken)
    {
        var regla = await _repository.GetByIdAsync(request.RuleId, cancellationToken);
        if (regla == null)
        {
            return false;
        }

        bool wasActive = regla.Activa;
        if (wasActive)
        {
            regla.Desactivar();
        }
        else
        {
            regla.Activar();
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = request.UsuarioId,
            TipoOperacion = TipoOperacion.Sistema,
            Accion = wasActive ? "Desactivación de Regla" : "Activación de Regla",
            Resultado = $"Regla {regla.Id} " + (wasActive ? "desactivada" : "activada"),
            ReferenciaExpedienteId = null,
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        }, cancellationToken);

        return true;
    }
}
