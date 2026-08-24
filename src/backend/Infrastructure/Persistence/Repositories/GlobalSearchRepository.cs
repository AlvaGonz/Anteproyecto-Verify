namespace Infrastructure.Persistence.Repositories;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Application.Abstractions.Persistence;
using Application.DTOs.Validation;
using Domain.Entities;
using System.Collections.Generic;

public class GlobalSearchRepository : IGlobalSearchRepository
{
    private readonly AppDbContext _context;

    public GlobalSearchRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SearchResultDto?> SearchGlobalAsync(string searchType, string query, CancellationToken cancellationToken = default)
    {
        return searchType.ToLowerInvariant() switch
        {
            "rnc" => await SearchRncAsync(query, cancellationToken),
            "suelo" => await SearchSueloAsync(query, cancellationToken),
            "ipi" => await SearchIpiAsync(query, cancellationToken),
            "cert" => await SearchCertAsync(query, cancellationToken),
            _ => null
        };
    }

    private async Task<SearchResultDto?> SearchRncAsync(string query, CancellationToken ct)
    {
        var cleanQuery = query.Replace("-", "").Trim();
        var dgii = await _context.DGII.FirstOrDefaultAsync(d => d.Rnc.Replace("-", "") == cleanQuery, ct);
        if (dgii == null) return null;

        var result = new SearchResultDto
        {
            TipoConsulta = "RNC",
            EsValido = true,
            TituloPrincipal = dgii.NombreRazonSocial,
            Detalles = new Dictionary<string, string>
            {
                { "RNC", dgii.Rnc },
                { "Estado", dgii.Estado ?? "Desconocido" },
                { "Actividad Económica", dgii.ActividadEconomica ?? "N/A" }
            }
        };

        // Buscar proyectos asociados
        var proyectos = await _context.Proyectos
            .Include(p => p.Estado)
            .Where(p => (p.RncDesarrollador != null && p.RncDesarrollador.Replace("-", "") == cleanQuery) || 
                        (p.CedulaRncPropietario != null && p.CedulaRncPropietario.Replace("-", "") == cleanQuery))
            .ToListAsync(ct);

        await BuildGraphAndDocumentsAsync(result, query, dgii.NombreRazonSocial, "Entidad", proyectos, ct);

        return result;
    }

    private async Task<SearchResultDto?> SearchSueloAsync(string query, CancellationToken ct)
    {
        var cleanQuery = query.Replace("-", "").Trim();
        var licencia = await _context.LicenciasConstruccion.FirstOrDefaultAsync(l => l.NumeroPermiso.Replace("-", "").Contains(cleanQuery), ct);
        if (licencia == null) return null;

        var result = new SearchResultDto
        {
            TipoConsulta = "Permiso de Suelo",
            EsValido = true,
            TituloPrincipal = $"Permiso: {licencia.NumeroPermiso}",
            Detalles = new Dictionary<string, string>
            {
                { "Número Permiso", licencia.NumeroPermiso },
                { "Proyecto Asignado", licencia.NombreProyecto },
                { "Fecha Emisión", licencia.FechaEmision?.ToString("yyyy-MM-dd") ?? "N/A" }
            }
        };

        var proyectos = await _context.Proyectos
            .Include(p => p.Estado)
            .Where(p => p.Nombre.Contains(licencia.NombreProyecto) || licencia.NombreProyecto.Contains(p.Nombre))
            .ToListAsync(ct);

        await BuildGraphAndDocumentsAsync(result, query, $"Permiso {licencia.NumeroPermiso}", "Permiso", proyectos, ct);

        return result;
    }

    private async Task<SearchResultDto?> SearchIpiAsync(string query, CancellationToken ct)
    {
        var cleanQuery = query.Replace("-", "").Trim();
        var ipi = await _context.PagosIPI.FirstOrDefaultAsync(p => p.NoCertificacion != null && p.NoCertificacion.Replace("-", "") == cleanQuery, ct);
        if (ipi == null) return null;

        var result = new SearchResultDto
        {
            TipoConsulta = "IPI",
            EsValido = true,
            TituloPrincipal = $"IPI: {ipi.NoCertificacion}",
            Detalles = new Dictionary<string, string>
            {
                { "Número IPI", ipi.NoCertificacion ?? "N/A" },
                { "Estado de Pago", ipi.Estatus ?? "N/A" },
                { "Cuota", ipi.Cuota_ipi.ToString("C") }
            }
        };

        var proyectos = await _context.Proyectos
            .Include(p => p.Estado)
            .Where(p => p.Ipi != null && p.Ipi.Replace("-", "") == cleanQuery)
            .ToListAsync(ct);

        await BuildGraphAndDocumentsAsync(result, query, $"IPI {ipi.NoCertificacion}", "Impuesto", proyectos, ct);

        return result;
    }

    private async Task<SearchResultDto?> SearchCertAsync(string query, CancellationToken ct)
    {
        var cleanQuery = query.Trim();
        var sello = await _context.SellosIntegridad.FirstOrDefaultAsync(s => s.CodigoSello == cleanQuery, ct);
        if (sello == null) return null;

        var result = new SearchResultDto
        {
            TipoConsulta = "Certificación",
            EsValido = true,
            TituloPrincipal = sello.Nombre,
            Detalles = new Dictionary<string, string>
            {
                { "Código", sello.CodigoSello },
                { "Nivel", sello.Nivel.ToString() },
                { "Estado", sello.Estado.ToString() },
                { "Emisión", sello.FechaEmisionUtc.ToString("yyyy-MM-dd") }
            }
        };

        var proyectos = await _context.Proyectos
            .Include(p => p.Estado)
            .Where(p => p.Id == sello.ProyectoId)
            .ToListAsync(ct);

        await BuildGraphAndDocumentsAsync(result, cleanQuery, sello.Nombre, "Certificado", proyectos, ct);

        return result;
    }

    private async Task BuildGraphAndDocumentsAsync(SearchResultDto result, string rootId, string rootLabel, string rootType, List<Proyecto> proyectos, CancellationToken ct)
    {
        result.ProyectosRelacionados = proyectos.Select(p => new ProjectoBasicDto
        {
            Id = p.Id,
            Nombre = p.Nombre,
            Estado = p.Estado?.Nombre ?? "Desconocido"
        }).ToList();

        // Node for the entity itself
        result.GrafoRed.Nodos.Add(new NetworkNodeDto { Id = rootId, Etiqueta = rootLabel, Tipo = rootType });

        var proyectoIds = new List<Guid>();
        // Nodes for projects
        foreach (var p in proyectos)
        {
            var pId = p.Id.ToString();
            proyectoIds.Add(p.Id);
            result.GrafoRed.Nodos.Add(new NetworkNodeDto { Id = pId, Etiqueta = p.Nombre, Tipo = "Proyecto" });
            result.GrafoRed.Enlaces.Add(new NetworkEdgeDto { OrigenId = rootId, DestinoId = pId, Relacion = "Vinculado A" });
        }

        if (proyectoIds.Any())
        {
            var documentos = await _context.Documentos
                .Where(d => proyectoIds.Contains(d.ProyectoId) && d.Activo)
                .Select(d => new DocumentoBasicDto
                {
                    Id = d.Id,
                    Nombre = d.NombreArchivoOriginal,
                    Tipo = d.TipoDocumento.ToString(),
                    Estado = d.EstadoDocumento.ToString()
                })
                .ToListAsync(ct);
            result.DocumentosRelacionados = documentos;
        }
    }
}
