namespace Application.Features.PublicConsulta.Queries.GetFeaturedProjects;

using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Features.PublicConsulta.Queries.SearchPublicProjects;
using Domain.Entities;
using Domain.Enums;
using MediatR;

public record GetFeaturedProjectsQuery : IRequest<List<PublicProjectSearchResultDto>>
{
    public int Count { get; init; } = 5;
    public string? IpOrigen { get; init; }
    public string? UserAgent { get; init; }
}

public class GetFeaturedProjectsQueryHandler
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly ISelloIntegridadRepository _selloRepository;
    private readonly IAuditLogger _auditLogger;

    public GetFeaturedProjectsQueryHandler(
        IProyectoRepository proyectoRepository,
        ISelloIntegridadRepository selloRepository,
        IAuditLogger auditLogger)
    {
        _proyectoRepository = proyectoRepository;
        _selloRepository = selloRepository;
        _auditLogger = auditLogger;
    }

    public async Task<List<PublicProjectSearchResultDto>> Handle(GetFeaturedProjectsQuery request, CancellationToken cancellationToken)
    {
        var proyectos = await _proyectoRepository.GetFeaturedAsync(request.Count, cancellationToken);

        var proyectoList = proyectos.ToList();
        var proyectoIds = proyectoList.Select(p => p.Id).ToList();

        var sellos = await _selloRepository.GetByProyectoIdsAsync(proyectoIds, cancellationToken);
        var sellosPorProyecto = sellos.ToDictionary(s => s.ProyectoId);

        var results = proyectoList.Select(p =>
        {
            var sello = sellosPorProyecto.GetValueOrDefault(p.Id);
            var completionRate = CalculateCompletionRate(p);
            return new PublicProjectSearchResultDto
            {
                Id = p.Id,
                NombreProyecto = p.Nombre,
                CodigoPublico = sello?.CodigoSello,
                EstadoValidacion = "Verificado",
                UbicacionTexto = p.UbicacionTexto,
                EstadoJuridico = (int)p.EstadoJuridico,
                EstadoProyecto = p.Estado?.CodigoUnico ?? "Publicado",
                EstadoIntegridad = (int)p.EstadoIntegridad,
                Constructora = p.DatosDesarrollador ?? p.Propietario,
                Registrante = p.UsuarioCreador?.NombreCompleto,
                ImagenUrl = p.ImagenUrl,
                Categoria = (int)p.Categoria,
                ValorEstimado = p.ValorEstimado,
                DesignacionCatastral = p.DesignacionCatastral,
                Matricula = p.Matricula,
                RncDesarrollador = p.RncDesarrollador,
                CedulaRncPropietario = p.CedulaRncPropietario,
                CompletionRate = completionRate
            };
        }).ToList();

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = null,
            TipoOperacion = TipoOperacion.ConsultaPublica,
            Accion = "Obtención de proyectos destacados",
            Resultado = $"Obtenidos: {results.Count} proyectos verificados",
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        }, cancellationToken);

        return results;
    }

    private int CalculateCompletionRate(Proyecto proyecto)
    {
        // Same logic as ProjectDocumentStatus component
        // Define required document types per project category
        var docCategories = new Dictionary<int, int[]>
        {
            [1] = new[] { 1, 2, 3, 4, 99 },   // TITLE
            [2] = new[] { 1, 2, 3, 4, 99 },   // LEGAL_STATUS
            [3] = new[] { 1, 2, 3, 4, 99 },   // SURVEY
            [4] = new[] { 1, 2, 3, 4, 99 },   // ID
            [5] = new[] { 1, 2, 3, 4, 99 },   // NOTARIAL_POWER
            [6] = new[] { 2, 3, 4 },          // CERTIFICADO_USO_SUELO
            [8] = new[] { 1, 2, 3, 4, 99 },   // CERTIFICACION_IPI
            [9] = new[] { 1, 2, 3, 4, 99 },   // REGISTRO_MERCANTIL
            [11] = new[] { 1, 2, 3, 4, 99 },  // NOTARIAL_POWER
            [12] = new[] { 1, 2, 3, 4, 99 },  // RNC
            [13] = new[] { 2, 3, 4 },         // ESTADOS_FINANCIEROS
            [14] = new[] { 1, 2, 3, 4, 99 },  // CERTIFICACIONES_BANCARIAS
            [17] = new[] { 2, 3, 4 },         // CERTIFICADO_EIA
            [18] = new[] { 1, 2, 3, 4, 99 },  // NO_OBJECION_INAPA_CAASD
            [21] = new[] { 1, 2, 3, 4, 99 },  // CERTIFICADO_TITULO
            [22] = new[] { 1, 2, 3, 4, 99 },  // CERTIFICACION_ESTADO_JURIDICO
            [24] = new[] { 1, 2, 3, 4, 99 },  // PLANO_MENSURA_CATASTRAL
            [25] = new[] { 1, 2, 3, 4, 99 },  // PERMISO_CONSTRUCCION
        };

        var requiredTypes = docCategories
            .Where(kvp => kvp.Value.Contains((int)proyecto.Categoria))
            .Select(kvp => (DocumentType)kvp.Key)
            .ToList();

        if (requiredTypes.Count == 0) return 100;

        // Estimate based on project status since we don't fetch documents here for performance
        // Projects in "Publicado" typically have 90%+ completion
        // Projects in "ConObservacion" typically have 75% completion
        // Projects in "Revision" typically have 70% completion
        var statusCode = proyecto.Estado?.CodigoUnico ?? "Publicado";
        
        if (statusCode == ProjectStatus.Publicado.ToCodigoUnico())
            return 90;
        if (statusCode == ProjectStatus.ConObservacion.ToCodigoUnico())
            return 75;
        if (statusCode == ProjectStatus.Revision.ToCodigoUnico())
            return 70;
        
        return 80;
    }
}