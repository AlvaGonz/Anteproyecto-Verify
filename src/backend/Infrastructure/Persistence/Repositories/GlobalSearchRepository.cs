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
            "cedula" => await SearchCedulaAsync(query, cancellationToken),
            "suelo" => await SearchSueloAsync(query, cancellationToken),
            "ipi" => await SearchIpiAsync(query, cancellationToken),
            _ => null
        };
    }

    private async Task<SearchResultDto?> SearchRncAsync(string query, CancellationToken ct)
    {
        var cleanQuery = query.Replace("-", "").Trim();
        var dgii = await _context.DGII.FirstOrDefaultAsync(d => d.Rnc == cleanQuery || d.Rnc == query, ct);
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
            .Where(p => p.RncDesarrollador == cleanQuery || p.CedulaRncPropietario == cleanQuery || p.RncDesarrollador == query || p.CedulaRncPropietario == query)
            .ToListAsync(ct);

        await BuildGraphAndDocumentsAsync(result, query, dgii.NombreRazonSocial, "Entidad", proyectos, ct);

        return result;
    }

    private async Task<SearchResultDto?> SearchCedulaAsync(string query, CancellationToken ct)
    {
        var cleanQuery = query.Replace("-", "").Trim();
        var persona = await _context.JCE_Ciudadanos.FirstOrDefaultAsync(c => c.Cedula == cleanQuery || c.Cedula == query, ct);
        if (persona == null) return null;

        var result = new SearchResultDto
        {
            TipoConsulta = "Cédula",
            EsValido = true,
            TituloPrincipal = "Ciudadano Registrado",
            Detalles = new Dictionary<string, string>
            {
                // Mask cedula based on user requirement
                { "Cédula", MaskCedula(persona.Cedula) },
                { "Nombres", persona.Nombres },
                { "Apellidos", persona.Apellidos },
                { "Nacimiento", persona.FechaNacimiento.ToString("yyyy-MM-dd") }
            }
        };

        var proyectos = await _context.Proyectos
            .Include(p => p.Estado)
            .Where(p => p.CedulaRncPropietario == cleanQuery || p.CedulaRncPropietario == query)
            .ToListAsync(ct);

        await BuildGraphAndDocumentsAsync(result, query, "Ciudadano Registrado", "Ciudadano", proyectos, ct);

        return result;
    }

    private async Task<SearchResultDto?> SearchSueloAsync(string query, CancellationToken ct)
    {
        var cleanQuery = query.Replace("-", "").Trim();
        var licencia = await _context.LicenciasConstruccion.FirstOrDefaultAsync(l => l.NumeroPermiso == cleanQuery || l.NumeroPermiso == query, ct);
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
        var ipi = await _context.PagosIPI.FirstOrDefaultAsync(p => p.NoCertificacion == cleanQuery || p.NoCertificacion == query, ct);
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
            .Where(p => p.Ipi == cleanQuery || p.Ipi == query)
            .ToListAsync(ct);

        await BuildGraphAndDocumentsAsync(result, query, $"IPI {ipi.NoCertificacion}", "Impuesto", proyectos, ct);

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

    private string MaskCedula(string cedula)
    {
        if (string.IsNullOrWhiteSpace(cedula) || cedula.Length < 11) return cedula;
        // e.g. 402-1234567-8 -> 402-***4567-*
        var clean = cedula.Replace("-", "");
        if (clean.Length == 11)
        {
            return $"{clean.Substring(0, 3)}-***{clean.Substring(6, 4)}-*";
        }
        return "***";
    }
}
