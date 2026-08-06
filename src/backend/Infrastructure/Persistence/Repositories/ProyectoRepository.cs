namespace Infrastructure.Persistence.Repositories;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

public class ProyectoRepository : IProyectoRepository
{
    private readonly AppDbContext _context;

    public ProyectoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Proyecto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Proyectos
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Include(p => p.CategoriaProyecto)
            .Include(p => p.Provincia!)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<(IEnumerable<Proyecto> Items, int TotalCount)> GetAllWithCountAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, string? searchTerm = null, string? estados = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Proyectos
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Include(p => p.CategoriaProyecto)
            .Include(p => p.Provincia!)
            .AsQueryable();

        if (usuarioId.HasValue)
        {
            query = query.Where(p => p.UsuarioCreadorId == usuarioId.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(p =>
                (p.Nombre != null && p.Nombre.ToLower().Contains(term)) ||
                (p.DesignacionCatastral != null && p.DesignacionCatastral.ToLower().Contains(term)) ||
                (p.Matricula != null && p.Matricula.ToLower().Contains(term)) ||
                (p.UbicacionTexto != null && p.UbicacionTexto.ToLower().Contains(term)) ||
                (p.UbicacionGps != null && p.UbicacionGps.ToLower().Contains(term)) ||
                (p.DatosDesarrollador != null && p.DatosDesarrollador.ToLower().Contains(term)) ||
                (p.RncDesarrollador != null && p.RncDesarrollador.ToLower().Contains(term)) ||
                (p.CedulaRncPropietario != null && p.CedulaRncPropietario.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(estados))
        {
            var codigos = estados.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (codigos.Length > 0)
            {
                query = query.Where(p => p.Estado != null && codigos.Contains(p.Estado.CodigoUnico));
            }
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IEnumerable<Proyecto>> GetAllAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var query = _context.Proyectos
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Include(p => p.CategoriaProyecto)
            .AsQueryable();

        if (usuarioId.HasValue)
        {
            query = query.Where(p => p.UsuarioCreadorId == usuarioId.Value);
        }

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Proyecto> Items, int TotalCount)> GetVisibleWithCountAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var draftCode = ProjectStatus.Creado.ToCodigoUnico();

        var query = _context.Proyectos
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Include(p => p.CategoriaProyecto)
            .Where(p => p.Estado.CodigoUnico != draftCode);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IEnumerable<Proyecto>> GetVisibleAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var draftCode = ProjectStatus.Creado.ToCodigoUnico();

        return await _context.Proyectos
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Include(p => p.CategoriaProyecto)
            .Where(p => p.Estado.CodigoUnico != draftCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> GetPublishedAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var publicadoCode = ProjectStatus.Publicado.ToCodigoUnico();

        return await _context.Proyectos
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Where(p => p.Estado.CodigoUnico == publicadoCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> SearchPublishedAsync(string query, CancellationToken cancellationToken = default)
    {
        var publicadoCode = ProjectStatus.Publicado.ToCodigoUnico();
        
        return await _context.Proyectos
            .AsNoTracking()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Where(p => 
                (p.CedulaRncPropietario == query ||
                p.Ipi == query ||
                p.RncDesarrollador == query ||
                p.Matricula == query ||
                _context.SellosIntegridad.Any(s => s.ProyectoId == p.Id && s.CodigoSello == query))
                && p.Estado.CodigoUnico == publicadoCode
            )
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> GetFeaturedAsync(int count = 5, CancellationToken cancellationToken = default)
    {
        var draftCode = ProjectStatus.Creado.ToCodigoUnico();
        var publicadoCode = ProjectStatus.Publicado.ToCodigoUnico();
        var conObservacionCode = ProjectStatus.ConObservacion.ToCodigoUnico();
        var revisionCode = ProjectStatus.Revision.ToCodigoUnico();

        return await _context.Proyectos
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Where(p => p.Estado.CodigoUnico != draftCode
                && p.EstadoIntegridad == IntegrityStatus.Valid
                && p.EstadoJuridico == EstadoJuridico.Valido
                && (p.Estado.CodigoUnico == publicadoCode || p.Estado.CodigoUnico == conObservacionCode || p.Estado.CodigoUnico == revisionCode))
            .OrderByDescending(p => p.UpdatedAtUtc ?? p.CreatedAtUtc)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProyectoEstado?> GetEstadoByStatusAsync(ProjectStatus status, CancellationToken cancellationToken = default)
    {
        var codigo = status.ToCodigoUnico();
        return await _context.ProyectoEstados
            .FirstOrDefaultAsync(e => e.CodigoUnico == codigo, cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        return await _context.Proyectos
            .AsNoTracking()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Include(p => p.CategoriaProyecto)
            .Where(p => 
                p.CedulaRncPropietario == query ||
                p.Ipi == query ||
                p.RncDesarrollador == query ||
                p.Matricula == query ||
                _context.SellosIntegridad.Any(s => s.ProyectoId == p.Id && s.CodigoSello == query)
            )
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountByUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        return await _context.Proyectos
            .CountAsync(p => p.UsuarioCreadorId == usuarioId, cancellationToken);
    }

    public async Task<IEnumerable<CategoriaProyecto>> GetCategoriasAsync(CancellationToken cancellationToken = default)
    {
        return await _context.CategoriasProyecto
            .Where(c => c.Activo)
            .OrderBy(c => c.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Proyecto proyecto, CancellationToken cancellationToken = default)
    {
        await _context.Proyectos.AddAsync(proyecto, cancellationToken);
    }

    public void Update(Proyecto proyecto)
    {
        _context.Proyectos.Update(proyecto);
    }

    public void Delete(Proyecto proyecto)
    {
        _context.Proyectos.Remove(proyecto);
    }

    /// <summary>
    /// Deletes all related records with Restrict FK constraints before removing the project itself.
    /// Necessary because SellosIntegridad, ResultadosCrediticios, LogProyectos, and Auditorias
    /// use DeleteBehavior.Restrict — EF cannot cascade them automatically.
    /// </summary>
    public async Task DeleteWithRelatedDataAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        var proyecto = await GetByIdAsync(proyectoId, cancellationToken);
        if (proyecto == null) throw new KeyNotFoundException($"Proyecto {proyectoId} no encontrado.");

        var sellos = await _context.Set<SelloIntegridad>().Where(s => s.ProyectoId == proyectoId).ToListAsync(cancellationToken);
        _context.Set<SelloIntegridad>().RemoveRange(sellos);

        var rCrediticios = await _context.Set<ResultadoCrediticio>().Where(r => r.ProyectoId == proyectoId).ToListAsync(cancellationToken);
        _context.Set<ResultadoCrediticio>().RemoveRange(rCrediticios);

        var logs = await _context.LogProyectos.Where(l => l.ProyectoId == proyectoId).ToListAsync(cancellationToken);
        _context.LogProyectos.RemoveRange(logs);

        var auditorias = await _context.Auditorias.Where(a => a.ProyectoId == proyectoId).ToListAsync(cancellationToken);
        _context.Auditorias.RemoveRange(auditorias);

        var intereses = await _context.ProyectosInteresados.Where(i => i.ProjectId == proyectoId).ToListAsync(cancellationToken);
        _context.ProyectosInteresados.RemoveRange(intereses);

        var guardados = await _context.ProyectosGuardados.Where(g => g.ProjectId == proyectoId).ToListAsync(cancellationToken);
        _context.ProyectosGuardados.RemoveRange(guardados);

        _context.Proyectos.Remove(proyecto);
    }

    public async Task AddInteresAsync(ProyectoInteresado interes, CancellationToken cancellationToken = default)
    {
        await _context.ProyectosInteresados.AddAsync(interes, cancellationToken);
    }

    public async Task AddGuardadoAsync(ProyectoGuardado guardado, CancellationToken cancellationToken = default)
    {
        await _context.ProyectosGuardados.AddAsync(guardado, cancellationToken);
    }

    public void RemoveGuardado(ProyectoGuardado guardado)
    {
        _context.ProyectosGuardados.Remove(guardado);
    }

    public void RemoveInteres(ProyectoInteresado interes)
    {
        _context.ProyectosInteresados.Remove(interes);
    }

    public async Task<ProyectoInteresado?> GetInteresAsync(Guid proyectoId, Guid usuarioId, CancellationToken cancellationToken = default)
    {
        return await _context.ProyectosInteresados
            .FirstOrDefaultAsync(i => i.ProjectId == proyectoId && i.InterestedUserId == usuarioId, cancellationToken);
    }

    public async Task<ProyectoGuardado?> GetGuardadoAsync(Guid proyectoId, Guid usuarioId, CancellationToken cancellationToken = default)
    {
        return await _context.ProyectosGuardados
            .FirstOrDefaultAsync(g => g.ProjectId == proyectoId && g.SaverId == usuarioId, cancellationToken);
    }

    public async Task<IEnumerable<ProyectoGuardado>> GetGuardadosByUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        return await _context.ProyectosGuardados
            .Include(g => g.Project)
                .ThenInclude(p => p.UsuarioCreador)
            .Include(g => g.Project)
                .ThenInclude(p => p.Estado)
            .Include(g => g.Project)
                .ThenInclude(p => p.CategoriaProyecto)
            .Where(g => g.SaverId == usuarioId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ProyectoInteresado>> GetInteresesByUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        return await _context.ProyectosInteresados
            .Include(i => i.Project)
                .ThenInclude(p => p.UsuarioCreador)
            .Include(i => i.InterestedUser)
            .Where(i => i.InterestedUserId == usuarioId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ProyectoInteresado>> GetInteresadosInUserProjectsAsync(Guid usuarioCreadorId, CancellationToken cancellationToken = default)
    {
        return await _context.ProyectosInteresados
            .Include(i => i.Project)
                .ThenInclude(p => p.UsuarioCreador)
            .Include(i => i.InterestedUser)
            .Where(i => i.CreatorId == usuarioCreadorId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddLogProyectoAsync(LogProyecto log, CancellationToken cancellationToken = default)
    {
        await _context.LogProyectos.AddAsync(log, cancellationToken);
    }

    public async Task<IEnumerable<Documento>> GetDocumentosByProyectoIdAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        return await _context.Documentos
            .AsNoTracking()
            .Where(d => d.ProyectoId == proyectoId && d.Activo)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetDocumentCompletionRateAsync(Guid proyectoId, int categoryId, CancellationToken cancellationToken = default)
    {
        // Define required document types for the project category (same logic as ProjectDocumentStatus component)
        var requiredTypes = GetRequiredDocumentTypesForCategory(categoryId);

        if (requiredTypes.Count == 0) return 100;

        // Get uploaded documents for this project that match required types and are not invalid
        var uploadedCount = await _context.Documentos
            .AsNoTracking()
            .Where(d => d.ProyectoId == proyectoId
                && d.Activo
                && d.EstadoDocumento != DocumentStatus.Invalid
                && requiredTypes.Contains(d.TipoDocumento))
            .CountAsync(cancellationToken);

        var rate = (int)Math.Round((double)uploadedCount / requiredTypes.Count * 100);
        return Math.Min(rate, 100);
    }

    private static List<DocumentType> GetRequiredDocumentTypesForCategory(int categoryId)
    {
        // Same logic as DOCUMENT_INFO in ProjectDocumentStatus.tsx
        var allTypes = new Dictionary<DocumentType, List<int>>
        {
            { DocumentType.TITLE, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.LEGAL_STATUS, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.SURVEY, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.ID, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.NOTARIAL_POWER, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.OTHER, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.CertificadoTitulo, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.CertificacionEstadoJuridico, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.PlanoMensuraCatastral, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.CertificadoUsoSuelo, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.CertificacionIPI, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.RegistroMercantil, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.PoderNotarial, new List<int> { 1, 2, 3, 4, 99 } },
            { DocumentType.RNC, new List<int> { 1, 2, 3, 4, 99 } },
        };

        var result = new List<DocumentType>();
        foreach (var kvp in allTypes)
        {
            if (kvp.Value.Contains(categoryId))
            {
                result.Add(kvp.Key);
            }
        }
        return result;
    }

    public async Task<bool> ExistsProvinciaAsync(Guid provinciaId, CancellationToken cancellationToken = default)
    {
        return await _context.Provincias.AnyAsync(p => p.IdProvincia == provinciaId, cancellationToken);
    }

    public async Task<bool> ExistsByUniquenessCriteriaAsync(Guid? excludeProjectId, string? gps, string? catastral, string? matricula, CancellationToken cancellationToken = default)
    {
        var query = _context.Proyectos.AsQueryable();
        if (excludeProjectId.HasValue)
        {
            query = query.Where(p => p.Id != excludeProjectId.Value);
        }

        if (string.IsNullOrEmpty(gps) && string.IsNullOrEmpty(catastral) && string.IsNullOrEmpty(matricula)) return false;

        bool checkCatastral = !string.IsNullOrEmpty(catastral);
        bool checkMatricula = !string.IsNullOrEmpty(matricula);
        
        // Exact match in DB for catastral or matricula
        if (checkCatastral || checkMatricula)
        {
            bool exactDbMatch = await query.AnyAsync(p => 
                (checkCatastral && p.DesignacionCatastral == catastral) ||
                (checkMatricula && p.Matricula == matricula), cancellationToken);
            if (exactDbMatch) return true;
        }

        // GPS logic in memory (5 meters proximity = ~0.000045 degrees)
        if (!string.IsNullOrEmpty(gps))
        {
            var parts = gps.Split(new[] { ',', ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2 && double.TryParse(parts[0], out var targetLat) && double.TryParse(parts[1], out var targetLng))
            {
                var gpsList = await query.Where(p => p.UbicacionGps != null && p.UbicacionGps != "")
                                         .Select(p => p.UbicacionGps)
                                         .ToListAsync(cancellationToken);
                
                foreach(var pGps in gpsList)
                {
                    if (string.IsNullOrEmpty(pGps)) continue;
                    var pParts = pGps.Split(new[] { ',', ' ' }, StringSplitOptions.RemoveEmptyEntries);
                    if (pParts.Length >= 2 && double.TryParse(pParts[0], out var pLat) && double.TryParse(pParts[1], out var pLng))
                    {
                        if (Math.Abs(pLat - targetLat) <= 0.000045 && Math.Abs(pLng - targetLng) <= 0.000045)
                        {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}
