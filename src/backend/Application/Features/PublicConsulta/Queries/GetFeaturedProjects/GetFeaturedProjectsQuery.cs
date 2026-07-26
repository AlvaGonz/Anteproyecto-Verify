namespace Application.Features.PublicConsulta.Queries.GetFeaturedProjects;

using System.Collections.Generic;
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
                CedulaRncPropietario = p.CedulaRncPropietario
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
}