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
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<(IEnumerable<Proyecto> Items, int TotalCount)> GetAllWithCountAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var query = _context.Proyectos
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.UsuarioCreador)
                .ThenInclude(u => u.Plan)
            .Include(p => p.Estado)
            .AsQueryable();

        if (usuarioId.HasValue)
        {
            query = query.Where(p => p.UsuarioCreadorId == usuarioId.Value);
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
            .Where(p => p.Estado.CodigoUnico != draftCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

    public async Task<int> GetDocumentCompletionRateAsync(Guid proyectoId, ProjectCategory category, CancellationToken cancellationToken = default)
    {
        // Define required document types for the project category (same logic as ProjectDocumentStatus component)
        var requiredTypes = GetRequiredDocumentTypesForCategory(category);

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

    private static List<DocumentType> GetRequiredDocumentTypesForCategory(ProjectCategory category)
    {
        // Same logic as DOCUMENT_INFO in ProjectDocumentStatus.tsx
        var allTypes = new Dictionary<DocumentType, List<ProjectCategory>>
        {
            { DocumentType.TITLE, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.LEGAL_STATUS, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.SURVEY, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.ID, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.NOTARIAL_POWER, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.OTHER, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.CertificadoTitulo, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.CertificacionEstadoJuridico, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.PlanoMensuraCatastral, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.PermisoConstruccion, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.CertificadoUsoSuelo, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.CertificacionIPI, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.RegistroMercantil, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.PoderNotarial, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.RNC, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.EstadosFinancieros, new List<ProjectCategory> { ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto } },
            { DocumentType.CertificacionesBancarias, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
            { DocumentType.CertificadoEIA, new List<ProjectCategory> { ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto } },
            { DocumentType.NoObjecionINAPACAASD, new List<ProjectCategory> { ProjectCategory.Residencial, ProjectCategory.Comercial, ProjectCategory.Turistico, ProjectCategory.Mixto, ProjectCategory.Otro } },
        };

        var result = new List<DocumentType>();
        foreach (var kvp in allTypes)
        {
            if (kvp.Value.Contains(category))
            {
                result.Add(kvp.Key);
            }
        }
        return result;
    }
}
