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
        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return new List<PublicProjectSearchResultDto>();
        }

        var proyectos = await _proyectoRepository.SearchAsync(request.Query, cancellationToken);
        var results = new List<PublicProjectSearchResultDto>();

        foreach (var p in proyectos)
        {
            var sello = await _selloRepository.GetByProyectoIdAsync(p.Id, cancellationToken);
            
            results.Add(new PublicProjectSearchResultDto
            {
                Id = p.Id,
                NombreProyecto = p.Nombre,
                CodigoPublico = sello?.CodigoSello,
                EstadoValidacion = p.EstadoProyecto == ProjectStatus.Verified ? "Verificado" : 
                                   p.EstadoProyecto == ProjectStatus.Rejected ? "NoVerificado" : "ConObservaciones",
                UbicacionTexto = p.UbicacionTexto
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
