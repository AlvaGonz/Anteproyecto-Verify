namespace Application.Features.ReglasValidacion.Commands.CreateRule;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Domain.Enums;

public class CreateRuleCommandHandler
{
    private readonly IReglaValidacionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _auditLogger;

    public CreateRuleCommandHandler(
        IReglaValidacionRepository repository,
        IUnitOfWork unitOfWork,
        IAuditLogger auditLogger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _auditLogger = auditLogger;
    }

    public async Task<Guid> Handle(CreateRuleCommand request, CancellationToken cancellationToken)
    {
        if (request.UsuarioId == null)
        {
            throw new UnauthorizedAccessException("Usuario no autorizado para crear reglas.");
        }

        var regla = new ReglaValidacion(
            request.Nombre,
            request.Descripcion,
            request.CondicionLogica,
            request.TipoDocumentoAplicable,
            request.NivelAlerta,
            request.TipoProyecto,
            request.UsuarioId.Value
        );

        await _repository.AddAsync(regla, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = request.UsuarioId,
            TipoOperacion = TipoOperacion.Sistema,
            Accion = "Creación de Regla de Validación",
            Resultado = $"Regla {regla.Id} creada",
            ReferenciaExpedienteId = null,
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        }, cancellationToken);

        return regla.Id;
    }
}
