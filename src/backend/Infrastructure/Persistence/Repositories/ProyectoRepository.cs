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

    public async Task<(IEnumerable<Proyecto> Items, int TotalCount)> GetAllWithCountAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, string? searchTerm = null, string? estados = null, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
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

        if (startDate.HasValue)
        {
            query = query.Where(p => p.CreatedAtUtc >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            var endOfDay = endDate.Value.Date.AddDays(1);
            query = query.Where(p => p.CreatedAtUtc < endOfDay);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.UpdatedAtUtc ?? p.CreatedAtUtc)
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
            .OrderByDescending(p => p.UpdatedAtUtc ?? p.CreatedAtUtc)
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
            .OrderByDescending(p => p.UpdatedAtUtc ?? p.CreatedAtUtc)
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
            .OrderByDescending(p => p.UpdatedAtUtc ?? p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> GetPublishedAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var publicadoCode = ProjectStatus.Publicado.ToCodigoUnico();
        var conObservacionCode = ProjectStatus.ConObservacion.ToCodigoUnico();

        return await _context.Proyectos
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Where(p => p.Estado.CodigoUnico == publicadoCode || p.Estado.CodigoUnico == conObservacionCode)
            .OrderByDescending(p => p.UpdatedAtUtc ?? p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Proyecto> Items, int TotalCount)> GetPublishedPaginatedAsync(int page = 1, int pageSize = 12, CancellationToken cancellationToken = default)
    {
        var publicadoCode = ProjectStatus.Publicado.ToCodigoUnico();
        var conObservacionCode = ProjectStatus.ConObservacion.ToCodigoUnico();

        var query = _context.Proyectos
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Where(p => p.Estado.CodigoUnico == publicadoCode || p.Estado.CodigoUnico == conObservacionCode);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.UpdatedAtUtc ?? p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IEnumerable<Proyecto>> SearchPublishedAsync(string query, CancellationToken cancellationToken = default)
    {
        var cleanQuery = query.Replace("-", "").Replace(" ", "");
        var publicadoCode = ProjectStatus.Publicado.ToCodigoUnico();
        var conObservacionCode = ProjectStatus.ConObservacion.ToCodigoUnico();
        
        return await _context.Proyectos
            .AsNoTracking()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Where(p => 
                (p.CedulaRncPropietario != null && p.CedulaRncPropietario.Replace("-", "").Replace(" ", "") == cleanQuery ||
                p.Ipi != null && p.Ipi.Replace("-", "").Replace(" ", "") == cleanQuery ||
                p.RncDesarrollador != null && p.RncDesarrollador.Replace("-", "").Replace(" ", "") == cleanQuery ||
                p.Matricula != null && p.Matricula.Replace("-", "").Replace(" ", "") == cleanQuery ||
                _context.SellosIntegridad.Any(s => s.ProyectoId == p.Id && s.CodigoSello == query))
                && (p.Estado.CodigoUnico == publicadoCode || p.Estado.CodigoUnico == conObservacionCode)
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

    public async Task<IEnumerable<ProyectoEstado>> GetEstadosCatalogoAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ProyectoEstados
            .AsNoTracking()
            .Where(e => e.Activo)
            .OrderBy(e => e.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Proyecto>> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        var cleanQuery = query.Replace("-", "").Replace(" ", "");
        return await _context.Proyectos
            .AsNoTracking()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .Include(p => p.CategoriaProyecto)
            .Where(p => 
                (p.CedulaRncPropietario != null && p.CedulaRncPropietario.Replace("-", "").Replace(" ", "") == cleanQuery) ||
                (p.Ipi != null && p.Ipi.Replace("-", "").Replace(" ", "") == cleanQuery) ||
                (p.RncDesarrollador != null && p.RncDesarrollador.Replace("-", "").Replace(" ", "") == cleanQuery) ||
                (p.Matricula != null && p.Matricula.Replace("-", "").Replace(" ", "") == cleanQuery) ||
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
        var rawUploadedTypes = await _context.Documentos
            .AsNoTracking()
            .Where(d => d.ProyectoId == proyectoId
                && d.Activo
                && d.EstadoDocumento != DocumentStatus.Invalid)
            .Select(d => d.TipoDocumento)
            .Distinct()
            .ToListAsync(cancellationToken);

        var uploadedSet = new HashSet<DocumentType>(rawUploadedTypes.Select(CanonicalDocType));

        var essentials = new[]
        {
            DocumentType.CertificadoTitulo,
            DocumentType.CertificacionEstadoJuridico,
            DocumentType.PlanoMensuraCatastral,
            DocumentType.ID,
            DocumentType.CertificacionIPI
        };

        var visibleAnexos = new[]
        {
            DocumentType.CertificadoUsoSuelo,
            DocumentType.PoderNotarial
        };

        var allAnexos = new[]
        {
            DocumentType.CertificadoUsoSuelo,
            DocumentType.RegistroMercantil,
            DocumentType.PoderNotarial,
            DocumentType.RNC,
            DocumentType.CertificadoEIA
        };

        const int essentialWeight = 80;
        const int anexoWeight = 20;

        int essentialCount = essentials.Count(t => uploadedSet.Contains(t));
        int anexoCount = allAnexos.Count(t => uploadedSet.Contains(t));

        int essentialPercent = essentials.Length > 0
            ? (int)Math.Round((double)essentialCount / essentials.Length * essentialWeight)
            : essentialWeight;
        int anexoPercent = visibleAnexos.Length > 0
            ? (int)Math.Round((double)anexoCount / visibleAnexos.Length * anexoWeight)
            : anexoWeight;

        return Math.Min(essentialPercent + anexoPercent, 100);
    }

    private static DocumentType CanonicalDocType(DocumentType tipo) => tipo switch
    {
        DocumentType.TITLE => DocumentType.CertificadoTitulo,
        DocumentType.LEGAL_STATUS => DocumentType.CertificacionEstadoJuridico,
        DocumentType.SURVEY => DocumentType.PlanoMensuraCatastral,
        DocumentType.NOTARIAL_POWER => DocumentType.PoderNotarial,
        _ => tipo
    };

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

    public async Task<double> GetAverageIntegridadValidadaAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        var validaciones = await _context.DatosValidados
            .AsNoTracking()
            .Where(dv => dv.ProyectoId == proyectoId)
            .Select(dv => dv.PorcentajeTotal)
            .ToListAsync(cancellationToken);

        if (validaciones == null || !validaciones.Any())
        {
            return 0;
        }

        return validaciones.Average();
    }
}
