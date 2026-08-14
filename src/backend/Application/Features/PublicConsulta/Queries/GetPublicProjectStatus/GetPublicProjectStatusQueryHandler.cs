namespace Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Contracts.Documents;
using Domain.Enums;

public class GetPublicProjectStatusQueryHandler
{
    private readonly ISelloIntegridadRepository _selloRepository;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IValidacionRepository _validacionRepository;
    private readonly IAuditLogger _auditLogger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDocumentService _documentService;

    public GetPublicProjectStatusQueryHandler(
        ISelloIntegridadRepository selloRepository,
        IProyectoRepository proyectoRepository,
        IValidacionRepository validacionRepository,
        IAuditLogger auditLogger,
        IUnitOfWork unitOfWork,
        IDocumentService documentService)
    {
        _selloRepository = selloRepository;
        _proyectoRepository = proyectoRepository;
        _validacionRepository = validacionRepository;
        _auditLogger = auditLogger;
        _unitOfWork = unitOfWork;
        _documentService = documentService;
    }

    public async Task<PublicProjectStatusDto?> Handle(GetPublicProjectStatusQuery request, CancellationToken cancellationToken)
    {
        Domain.Entities.SelloIntegridad? sello = null;

        if (!string.IsNullOrWhiteSpace(request.QrToken))
        {
            sello = await _selloRepository.GetByQrTokenAsync(request.QrToken, cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(request.CodigoPublico))
        {
            sello = await _selloRepository.GetByCodigoAsync(request.CodigoPublico, cancellationToken);
        }

        if (sello == null)
        {
            return null;
        }

        sello.VerificarVigencia();

        if (sello.Estado == Domain.Enums.EstadoSello.Revocado || sello.Estado == Domain.Enums.EstadoSello.Expirado)
        {
            return null;
        }

        var proyecto = await _proyectoRepository.GetByIdAsync(sello.ProyectoId, cancellationToken);
        if (proyecto == null)
        {
            return null;
        }

        // Increment access count for active seals
        sello.IncrementarAccesos();
        _selloRepository.Update(sello);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var validaciones = await _validacionRepository.GetByProyectoIdAsync(proyecto.Id, cancellationToken);

        var resumen = validaciones.Select(v => new DimensionResumenDto
        {
            Dimension = v.TipoValidacion,
            Resultado = v.Estado == ValidationStatus.Completed ? "Verificado" : "Pendiente/Con Observaciones"
        }).ToList();

        var docs = await _documentService.GetProjectDocumentsAsync(proyecto.Id, cancellationToken);
        var documentos = docs
            .Where(d => d.Activo && d.EstadoDocumento != DocumentStatus.Invalid)
            .Select(d => new PublicDocumentSummaryDto
            {
                Id = d.Id,
                TipoDocumento = (int)d.TipoDocumento,
                NombreArchivoOriginal = d.NombreArchivoOriginal,
                EstadoDocumento = (int)d.EstadoDocumento
            }).ToList();

        var dto = new PublicProjectStatusDto
        {
            Id = proyecto.Id,
            CodigoPublico = sello.CodigoSello,
            NombreProyecto = proyecto.Nombre,
            Ubicacion = proyecto.UbicacionTexto,
            EstadoValidacion = proyecto.Estado?.Nombre ?? "Desconocido",
            FechaEmision = sello.FechaEmisionUtc,
            ResumenDimensiones = resumen,
            Documentos = documentos
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
