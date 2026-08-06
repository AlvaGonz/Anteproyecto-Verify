namespace Application.Features.PublicConsulta.Queries.SearchPublicProjects;

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Domain.Entities;
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

    public async Task<PublicProjectSearchResponseDto> Handle(SearchPublicProjectsQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 200);

        IEnumerable<Domain.Entities.Proyecto> proyectosList;
        int totalCount;

        if (string.IsNullOrWhiteSpace(request.Query))
        {
            proyectosList = await _proyectoRepository.GetPublishedAsync(1, int.MaxValue, cancellationToken);
            totalCount = proyectosList.Count();
        }
        else
        {
            var searchResults = await _proyectoRepository.SearchPublishedAsync(request.Query, cancellationToken);
            proyectosList = searchResults;
            totalCount = searchResults.Count();
        }

        var proyectoList = proyectosList.ToList();
        var proyectoIds = proyectoList.Select(p => p.Id).ToList();

        var sellos = await _selloRepository.GetByProyectoIdsAsync(proyectoIds, cancellationToken);
        var sellosPorProyecto = sellos.ToDictionary(s => s.ProyectoId);

        var results = new List<PublicProjectSearchResultDto>();

        foreach (var p in proyectoList)
        {
            var sello = sellosPorProyecto.GetValueOrDefault(p.Id);
            var completionRate = await _proyectoRepository.GetDocumentCompletionRateAsync(p.Id, p.CategoriaId, cancellationToken);
            var integridadValidada = await _proyectoRepository.GetAverageIntegridadValidadaAsync(p.Id, cancellationToken);

            results.Add(new PublicProjectSearchResultDto
            {
                Id = p.Id,
                NombreProyecto = p.Nombre,
                CodigoPublico = sello?.CodigoSello,
                EstadoValidacion = p.Estado?.Nombre ?? "Desconocido",
                UbicacionTexto = p.UbicacionTexto,
                EstadoJuridico = (int)p.EstadoJuridico,
                EstadoProyecto = p.Estado?.CodigoUnico ?? "Desconocido",
                EstadoIntegridad = (int)p.EstadoIntegridad,
                Constructora = p.DatosDesarrollador ?? p.Propietario,
                Registrante = p.UsuarioCreador?.NombreCompleto,
                ImagenUrl = p.ImagenUrl,
                CategoriaId = p.CategoriaId,
                ValorEstimado = p.ValorEstimado,
                DesignacionCatastral = p.DesignacionCatastral,
                Matricula = p.Matricula,
                RncDesarrollador = p.RncDesarrollador,
                CedulaRncPropietario = p.CedulaRncPropietario,
                CompletionRate = completionRate,
                IntegridadValidada = (int)Math.Round(integridadValidada)
            });
        }

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = null,
            TipoOperacion = TipoOperacion.ConsultaPublica,
            Accion = "Búsqueda pública de proyectos",
            Resultado = $"Encontrados: {results.Count} para término {request.Query}, página {page}",
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        }, cancellationToken);

        return new PublicProjectSearchResponseDto
        {
            Items = results,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
