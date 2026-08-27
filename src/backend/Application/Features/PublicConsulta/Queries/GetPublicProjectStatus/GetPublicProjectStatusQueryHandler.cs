namespace Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Contracts.Documents;
using Application.DTOs;
using Domain.Enums;
using Domain.Policies;

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

    private static ProjectRegistrantPublicPresentationDto ToPresentationDto(PublicPresentation presentation)
    {
        var tipo = presentation.IdentificacionTipo switch
        {
            IdentificacionPublicaModo.Cedula => "cedula",
            IdentificacionPublicaModo.Rnc => "rnc",
            _ => null
        };

        return new ProjectRegistrantPublicPresentationDto(
            presentation.NombreMostrado,
            presentation.IdentificacionMostrada,
            tipo,
            presentation.RazonSocialMostrada);
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

        ProjectRegistrantDto? registradoPor = null;
        if (proyecto.UsuarioCreador != null)
        {
            var presentation = PublicIdentityResolver.Resolve(proyecto.UsuarioCreador, proyecto);
            registradoPor = new ProjectRegistrantDto(
                proyecto.UsuarioCreador.Id,
                proyecto.UsuarioCreador.NombreCompleto,
                proyecto.UsuarioCreador.RazonSocial,
                proyecto.UsuarioCreador.Rol.ToString(),
                proyecto.UsuarioCreador.Email,
                proyecto.UsuarioCreador.Telefono,
                proyecto.UsuarioCreador.AvatarUrl,
                proyecto.UsuarioCreador.CreatedAtUtc,
                proyecto.UsuarioCreador.EmailVerificado,
                proyecto.UsuarioCreador.TitularId,
                ToPresentationDto(presentation)
            );
        }

        var dto = new PublicProjectStatusDto
        {
            Id = proyecto.Id,
            CodigoPublico = sello.CodigoSello,
            CodigoInterno = proyecto.CodigoInterno,
            NombreProyecto = proyecto.Nombre,
            Nombre = proyecto.Nombre,
            Ubicacion = proyecto.UbicacionTexto,
            UbicacionTexto = proyecto.UbicacionTexto,
            UbicacionGps = proyecto.UbicacionGps,
            ImagenUrl = proyecto.ImagenUrl,
            ImagenAdicional1 = proyecto.ImagenAdicional1,
            ImagenAdicional2 = proyecto.ImagenAdicional2,
            ImagenAdicional3 = proyecto.ImagenAdicional3,
            ImagenAdicional4 = proyecto.ImagenAdicional4,
            ImagenAdicional5 = proyecto.ImagenAdicional5,
            ValorEstimado = proyecto.ValorEstimado,
            CategoriaId = proyecto.CategoriaId,
            CategoriaNombre = proyecto.CategoriaProyecto?.Nombre ?? "",
            DatosDesarrollador = proyecto.DatosDesarrollador,
            RncDesarrollador = proyecto.RncDesarrollador,
            DesignacionCatastral = proyecto.DesignacionCatastral,
            Matricula = proyecto.Matricula,
            Propietario = proyecto.Propietario,
            CedulaRncPropietario = proyecto.CedulaRncPropietario,
            Ipi = proyecto.Ipi,
            EstadoJuridico = proyecto.EstadoJuridico,
            EstatusIpi = proyecto.EstatusIpi,
            SuperficieM2 = proyecto.SuperficieM2,
            EstatusDescripcion = proyecto.EstatusDescripcion,
            EstadoProyecto = proyecto.Estado?.CodigoUnico ?? proyecto.Estado?.Nombre ?? "PUBLICADO",
            EstadoValidacion = proyecto.Estado?.Nombre ?? "PUBLICADO",
            EstadoIntegridad = proyecto.EstadoIntegridad,
            UsuarioCreadorId = proyecto.UsuarioCreadorId,
            CreatedAtUtc = proyecto.CreatedAtUtc,
            UpdatedAtUtc = proyecto.UpdatedAtUtc,
            Cercania = proyecto.Cercania,
            FechaEmision = sello.FechaEmisionUtc,
            RegistradoPor = registradoPor,
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
