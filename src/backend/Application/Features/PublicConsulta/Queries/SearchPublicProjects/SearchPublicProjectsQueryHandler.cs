namespace Application.Features.PublicConsulta.Queries.SearchPublicProjects;

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Enums;

public class SearchPublicProjectsQueryHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly ISelloIntegridadRepository _selloRepository;
    private readonly IAuditLogger _auditLogger;

    public SearchPublicProjectsQueryHandler(
        IProyectoRepository proyectoRepository,
        ISelloIntegridadRepository selloRepository,
        IAuditLogger auditLogger)
    {
        _proyectoRepository = proyectoRepository;
        _selloRepository = selloRepository;
        _auditLogger = auditLogger;
    }

    public async Task<List<PublicProjectSearchResultDto>> Handle(SearchPublicProjectsQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Domain.Entities.Proyecto> proyectos;

        if (string.IsNullOrWhiteSpace(request.Query))
        {
            proyectos = await _proyectoRepository.GetVisibleAsync(cancellationToken);
        }
        else
        {
            proyectos = await _proyectoRepository.SearchAsync(request.Query, cancellationToken);
        }
        var results = new List<PublicProjectSearchResultDto>();

        foreach (var p in proyectos)
        {
            var sello = await _selloRepository.GetByProyectoIdAsync(p.Id, cancellationToken);
            
            results.Add(new PublicProjectSearchResultDto
            {
                Id = p.Id,
                NombreProyecto = p.Nombre,
                CodigoPublico = sello?.CodigoSello,
                EstadoValidacion = p.Estado?.CodigoUnico == ProjectStatus.Publicado.ToCodigoUnico() ? "Verificado" : 
                                   p.Estado?.CodigoUnico == ProjectStatus.ConObservacion.ToCodigoUnico() ? "NoVerificado" : "ConObservaciones",
                UbicacionTexto = p.UbicacionTexto,
                EstadoJuridico = (int)p.EstadoJuridico,
                EstadoProyecto = p.Estado?.CodigoUnico ?? "Desconocido",
                EstadoIntegridad = (int)p.EstadoIntegridad,
                Constructora = p.DatosDesarrollador ?? p.Propietario,
                Registrante = p.UsuarioCreador?.NombreCompleto,
                ImagenUrl = p.ImagenUrl,
                Categoria = (int)p.Categoria,
                ValorEstimado = p.ValorEstimado,
                DesignacionCatastral = p.DesignacionCatastral,
                Matricula = p.Matricula,
                RncDesarrollador = p.RncDesarrollador,
                CedulaRncPropietario = p.CedulaRncPropietario
            });
        }

        // Log audit
        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = null,
            TipoOperacion = TipoOperacion.ConsultaPublica,
            Accion = "Búsqueda pública de proyectos",
            Resultado = $"Encontrados: {results.Count} para término {request.Query}",
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        }, cancellationToken);

        return results;
    }
}
