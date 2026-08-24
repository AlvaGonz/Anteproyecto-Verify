namespace Application.Features.ReglasValidacion.Commands.UpdateRule;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;

public class UpdateRuleCommandHandler
{
    private readonly IReglaValidacionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _auditLogger;

    public UpdateRuleCommandHandler(
        IReglaValidacionRepository repository,
        IUnitOfWork unitOfWork,
        IAuditLogger auditLogger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _auditLogger = auditLogger;
    }

    public async Task<bool> Handle(UpdateRuleCommand request, CancellationToken cancellationToken)
    {
        var regla = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (regla == null)
        {
            return false;
        }

        // Domain method validates range and updates invariants
        regla.Update(
            request.Nombre,
            request.Descripcion,
            request.CondicionLogica,
            request.TipoDocumentoAplicable,
            request.NivelAlerta,
            request.TipoProyecto,
            request.ValorUmbral,
            request.MinValor,
            request.MaxValor,
            request.Expresion,
            request.Codigo,
            request.Activa
        );

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = request.UsuarioId,
            TipoOperacion = TipoOperacion.Sistema,
            Accion = "Actualización de Regla de Validación",
            Resultado = $"Regla {regla.Id} ({regla.Nombre}) actualizada. Umbral: {regla.ValorUmbral:P2}",
            ReferenciaExpedienteId = null,
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        }, cancellationToken);

        return true;
    }
}
