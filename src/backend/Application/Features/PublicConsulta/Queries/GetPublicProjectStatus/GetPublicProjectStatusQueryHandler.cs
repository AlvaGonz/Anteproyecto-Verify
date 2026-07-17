namespace Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Enums;

public class GetPublicProjectStatusQueryHandler
{
    private readonly ISelloIntegridadRepository _selloRepository;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IValidacionRepository _validacionRepository;
    private readonly IAuditLogger _auditLogger;

    public GetPublicProjectStatusQueryHandler(
        ISelloIntegridadRepository selloRepository,
        IProyectoRepository proyectoRepository,
        IValidacionRepository validacionRepository,
        IAuditLogger auditLogger)
    {
        _selloRepository = selloRepository;
        _proyectoRepository = proyectoRepository;
        _validacionRepository = validacionRepository;
        _auditLogger = auditLogger;
    }

    public async Task<PublicProjectStatusDto?> Handle(GetPublicProjectStatusQuery request, CancellationToken cancellationToken)
    {
        var codigo = request.CodigoPublico ?? request.QrToken;
        if (string.IsNullOrWhiteSpace(codigo))
        {
            return null;
        }

        var sello = await _selloRepository.GetByCodigoAsync(codigo, cancellationToken);
        if (sello == null)
        {
            return null;
        }

        var proyecto = await _proyectoRepository.GetByIdAsync(sello.ProyectoId, cancellationToken);
        if (proyecto == null)
        {
            return null;
        }

        var validaciones = await _validacionRepository.GetByProyectoIdAsync(proyecto.Id, cancellationToken);

        var resumen = validaciones.Select(v => new DimensionResumenDto
        {
            Dimension = v.TipoValidacion,
            Resultado = v.Estado == ValidationStatus.Completed ? "Verificado" : "Pendiente/Con Observaciones"
        }).ToList();

        var dto = new PublicProjectStatusDto
        {
            CodigoPublico = sello.CodigoSello,
            NombreProyecto = proyecto.Nombre,
            EstadoValidacion = proyecto.Estado?.CodigoUnico == ProjectStatus.Publicado.ToCodigoUnico() ? "Verificado" : 
                               proyecto.Estado?.CodigoUnico == ProjectStatus.ConObservacion.ToCodigoUnico() ? "NoVerificado" : "ConObservaciones",
            FechaEmision = sello.FechaEmisionUtc,
            ResumenDimensiones = resumen
        };

        // Log audit
        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = null,
            TipoOperacion = TipoOperacion.ConsultaPublica,
            Accion = "Consulta de estado público",
            Resultado = "Exitosa",
            ReferenciaExpedienteId = proyecto.Id,
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        }, cancellationToken);

        return dto;
    }
}
