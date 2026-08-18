namespace Application.Features.Projects;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Contracts.Projects;
using Application.DTOs;
using Application.DTOs.Common;
using Application.DTOs.Projects;
using Domain.Entities;
using Domain.Enums;
using Domain.Policies;

using Application.Abstractions.Notifications;
using Application.Common.Exceptions;
using Application.Abstractions;

public class ProjectService : IProjectService
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IEmailNotificationService _emailNotificationService;
    private readonly INotificationFactory _notificationFactory;
    private readonly INotificacionRepository _notificacionRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogger _auditLogger;
    private readonly IReglaValidacionRepository _reglaValidacionRepository;

    public ProjectService(
        IProyectoRepository proyectoRepository, 
        IUsuarioRepository usuarioRepository,
        IEmailNotificationService emailNotificationService,
        INotificationFactory notificationFactory,
        INotificacionRepository notificacionRepository,
        IUnitOfWork unitOfWork,
        IAuditLogger auditLogger,
        IReglaValidacionRepository reglaValidacionRepository)
    {
        _proyectoRepository = proyectoRepository;
        _usuarioRepository = usuarioRepository;
        _emailNotificationService = emailNotificationService;
        _notificationFactory = notificationFactory;
        _notificacionRepository = notificacionRepository;
        _unitOfWork = unitOfWork;
        _auditLogger = auditLogger;
        _reglaValidacionRepository = reglaValidacionRepository;
    }

    public async Task<IEnumerable<ProyectoDto>> GetVisibleProjectsAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var proyectos = await _proyectoRepository.GetVisibleAsync(page, pageSize, cancellationToken);
        return proyectos.Select(MapToDto);
    }

    public async Task<IEnumerable<ProyectoEstadoCatalogoDto>> GetEstadosCatalogoAsync(CancellationToken cancellationToken = default)
    {
        var estados = await _proyectoRepository.GetEstadosCatalogoAsync(cancellationToken);
        return estados.Select(e => new ProyectoEstadoCatalogoDto(
            e.Id,
            e.CodigoUnico,
            e.Nombre,
            e.ColorHex));
    }

    public async Task<IEnumerable<ProyectoDto>> GetAllProjectsAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var proyectos = await _proyectoRepository.GetAllAsync(usuarioId, page, pageSize, cancellationToken);
        return proyectos.Select(MapToDto);
    }

    public async Task<PaginatedResult<ProyectoDto>> GetAllProjectsWithCountAsync(Guid? usuarioId = null, int page = 1, int pageSize = 50, string? searchTerm = null, string? estados = null, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _proyectoRepository.GetAllWithCountAsync(usuarioId, page, pageSize, searchTerm, estados, cancellationToken);
        return new PaginatedResult<ProyectoDto>(
            items.Select(MapToDto).ToList(),
            totalCount,
            page,
            pageSize
        );
    }

    public async Task<PaginatedResult<ProyectoDto>> GetVisibleProjectsWithCountAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _proyectoRepository.GetVisibleWithCountAsync(page, pageSize, cancellationToken);
        return new PaginatedResult<ProyectoDto>(
            items.Select(MapToDto).ToList(),
            totalCount,
            page,
            pageSize
        );
    }

    public async Task<ProyectoDto?> GetProjectByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
        if (proyecto == null) return null;

        await _auditLogger.Append(new AuditEntryDto
        {
            UsuarioId = proyecto.UsuarioCreadorId,
            TipoOperacion = TipoOperacion.ConsultaPublica,
            Accion = "Visualización de proyecto",
            Resultado = "Exitosa",
            ReferenciaExpedienteId = proyecto.Id
        }, cancellationToken);

        var integridadValidada = await _proyectoRepository.GetAverageIntegridadValidadaAsync(id, cancellationToken);
        return MapToDto(proyecto, (int)Math.Round(integridadValidada));
    }

    public async Task<ProyectoDto> CreateProjectAsync(CreateProyectoDto dto, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuarioRepository.GetByIdWithPlanAsync(dto.UsuarioCreadorId, cancellationToken);
        if (usuario == null)
        {
            throw new KeyNotFoundException($"User with id {dto.UsuarioCreadorId} not found.");
        }

        var proyectosActuales = await _proyectoRepository.CountByUsuarioAsync(dto.UsuarioCreadorId, cancellationToken);
        
        if (!SubscriptionTierPolicy.CanCreateProject(usuario, proyectosActuales))
        {
            throw new QuotaExceededException(
                SubscriptionTierPolicy.GetTierName(usuario), 
                "MaxProyectos", 
                "Límite de proyectos alcanzado para su plan actual. Considere mejorar su plan.");
        }

        var categoria = await ValidateCategoriaAsync(dto.CategoriaId, cancellationToken);

        if (dto.ProvinciaId.HasValue)
        {
            var provinciaExists = await _proyectoRepository.ExistsProvinciaAsync(dto.ProvinciaId.Value, cancellationToken);
            if (!provinciaExists)
            {
                throw new ArgumentException(
                    $"La provincia con Id {dto.ProvinciaId} no existe.",
                    nameof(dto.ProvinciaId));
            }
        }

        bool isDuplicate = await _proyectoRepository.ExistsByUniquenessCriteriaAsync(null, dto.UbicacionGps, dto.DesignacionCatastral, dto.Matricula, cancellationToken);
        if (isDuplicate && !dto.Force)
        {
            throw new InvalidOperationException("DUPLICATE_LOCATION"); // using this specific string to catch in frontend
        }

        var estadoCreado = await _proyectoRepository.GetEstadoByStatusAsync(ProjectStatus.Creado, cancellationToken);
        if (estadoCreado == null)
        {
            throw new InvalidOperationException(
                "Estado 'CREADO' no encontrado en ProyectosEstados. Ejecute el seeder o la migración de estados.");
        }

        var proyecto = new Proyecto(dto.Nombre, dto.UbicacionTexto, dto.UsuarioCreadorId, dto.CategoriaId, dto.DatosDesarrollador, dto.DesignacionCatastral, dto.Propietario, dto.CedulaRncPropietario, dto.Ipi, dto.EstatusIpi, dto.SuperficieM2, dto.ImagenUrl, dto.ImagenAdicional1, dto.ImagenAdicional2, dto.ImagenAdicional3, dto.ImagenAdicional4, dto.ImagenAdicional5, dto.ProvinciaId);
        proyecto.AsignarCategoria(categoria);
        proyecto.UpdateEstado(estadoCreado);
        if (!string.IsNullOrEmpty(dto.UbicacionGps))
        {
            proyecto.UpdateDetails(dto.Nombre, dto.UbicacionTexto, dto.UbicacionGps, null, dto.CategoriaId, dto.DatosDesarrollador, dto.DesignacionCatastral, dto.Propietario, dto.CedulaRncPropietario, dto.Ipi, dto.EstatusIpi, dto.SuperficieM2, dto.ImagenUrl, dto.ImagenAdicional1, dto.ImagenAdicional2, dto.ImagenAdicional3, dto.ImagenAdicional4, dto.ImagenAdicional5, dto.ProvinciaId);
        }
        if (!string.IsNullOrEmpty(dto.RncDesarrollador) || !string.IsNullOrEmpty(dto.Matricula))
        {
            proyecto.UpdateRncYMatricula(dto.RncDesarrollador, dto.Matricula);
        }
        
        await _proyectoRepository.AddAsync(proyecto, cancellationToken);

        // ponytail: log creation as initial status entry for history timeline (staged before single commit)
        await _auditLogger.Append(new AuditEntryDto
        {
            UsuarioId = dto.UsuarioCreadorId,
            TipoOperacion = TipoOperacion.CambioEstado,
            Accion = "Creación",
            Resultado = estadoCreado.CodigoUnico,
            ReferenciaExpedienteId = proyecto.Id,
            EstadoAnteriorId = null,
            EstadoNuevoId = estadoCreado.Id
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await NotifyProjectEvent(usuario, proyecto, TipoNotificacionId.ProyectoCreado,
            $"Proyecto \"{proyecto.Nombre}\" registrado exitosamente.",
            proyecto.Id, "Proyecto", cancellationToken);

        return MapToDto(proyecto);
    }

    public async Task<ProyectoDto> UpdateProjectAsync(Guid id, UpdateProyectoDto dto, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
        if (proyecto == null)
        {
            throw new KeyNotFoundException($"Project with id {id} not found.");
        }

        var categoria = await ValidateCategoriaAsync(dto.CategoriaId, cancellationToken);

        bool isDuplicate = await _proyectoRepository.ExistsByUniquenessCriteriaAsync(id, dto.UbicacionGps, dto.DesignacionCatastral, dto.Matricula, cancellationToken);
        if (isDuplicate && !dto.Force)
        {
            throw new InvalidOperationException("DUPLICATE_LOCATION"); // using this specific string to catch in frontend
        }

        var changedFields = new List<string>();
        if (proyecto.Nombre != dto.Nombre) changedFields.Add("Nombre");
        if (proyecto.UbicacionTexto != dto.UbicacionTexto) changedFields.Add("Ubicacion");
        if (proyecto.ValorEstimado != dto.ValorEstimado) changedFields.Add("ValorEstimado");
        if (proyecto.CategoriaId != dto.CategoriaId) changedFields.Add("Categoria");
        if (proyecto.DatosDesarrollador != dto.DatosDesarrollador) changedFields.Add("Desarrollador");
        if (proyecto.Propietario != dto.Propietario) changedFields.Add("Propietario");
        if (proyecto.SuperficieM2 != dto.SuperficieM2) changedFields.Add("Superficie");
        
        proyecto.UpdateDetails(dto.Nombre, dto.UbicacionTexto, dto.UbicacionGps, dto.ValorEstimado, dto.CategoriaId, dto.DatosDesarrollador, dto.DesignacionCatastral, dto.Propietario, dto.CedulaRncPropietario, dto.Ipi, dto.EstatusIpi, dto.SuperficieM2, dto.ImagenUrl, dto.ImagenAdicional1, dto.ImagenAdicional2, dto.ImagenAdicional3, dto.ImagenAdicional4, dto.ImagenAdicional5, dto.ProvinciaId);
        proyecto.AsignarCategoria(categoria);
        proyecto.UpdateRncYMatricula(dto.RncDesarrollador, dto.Matricula);

        if (changedFields.Any())
        {
            await _auditLogger.Append(new AuditEntryDto
            {
                UsuarioId = proyecto.UsuarioCreadorId,
                TipoOperacion = TipoOperacion.General,
                Accion = "Actualización de datos",
                Resultado = $"Campos modificados: {string.Join(", ", changedFields)}",
                ReferenciaExpedienteId = proyecto.Id
            }, cancellationToken);
        }

        // Auto-promote CREADO → EDITADO when the expediente is modified
        var currentCodigo = proyecto.Estado?.CodigoUnico;
        if (string.IsNullOrEmpty(currentCodigo) || currentCodigo == ProjectStatusCodes.Creado)
        {
            var oldEstadoId = proyecto.EstadoId;
            var estadoEditado = await _proyectoRepository.GetEstadoByStatusAsync(ProjectStatus.Editado, cancellationToken);
            if (estadoEditado == null)
            {
                throw new InvalidOperationException(
                    "Estado 'EDITADO' no encontrado en ProyectosEstados. Ejecute el seeder o la migración de estados.");
            }
            proyecto.UpdateEstado(estadoEditado);

            await _auditLogger.Append(new AuditEntryDto
            {
                UsuarioId = proyecto.UsuarioCreadorId,
                TipoOperacion = TipoOperacion.CambioEstado,
                Accion = "CambioEstado",
                Resultado = $"{currentCodigo} → {ProjectStatus.Editado.ToCodigoUnico()}",
                ReferenciaExpedienteId = id,
                EstadoAnteriorId = oldEstadoId,
                EstadoNuevoId = estadoEditado.Id
            }, cancellationToken);
        }
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updater = await _usuarioRepository.GetByIdAsync(proyecto.UsuarioCreadorId, cancellationToken);
        if (updater != null)
            await NotifyProjectEvent(updater, proyecto, TipoNotificacionId.ProyectoEditado,
                $"Proyecto \"{proyecto.Nombre}\" actualizado.", proyecto.Id, "Proyecto", cancellationToken);

        return MapToDto(proyecto);
    }

    public async Task<ProyectoDto> UpdateProjectStatusAsync(Guid id, ProjectStatus status, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
        if (proyecto == null)
        {
            throw new KeyNotFoundException($"Project with id {id} not found.");
        }

        if (status == ProjectStatus.Publicado)
        {
            var usuario = await _usuarioRepository.GetByIdWithPlanAsync(proyecto.UsuarioCreadorId, cancellationToken);
            if (usuario == null)
            {
                throw new KeyNotFoundException($"User with id {proyecto.UsuarioCreadorId} not found.");
            }

            if (!SubscriptionTierPolicy.IsProjectPublic(usuario))
            {
                throw new QuotaExceededException(
                    SubscriptionTierPolicy.GetTierName(usuario), 
                    "PresentacionPublica", 
                    "Su plan actual (Consultor) no permite la publicación de proyectos.");
            }

            if (!string.IsNullOrEmpty(proyecto.EstatusIpi) && proyecto.EstatusIpi == "PAGO_PENDIENTE")
            {
                var activeRules = await _reglaValidacionRepository.GetActiveRulesAsync(
                    (TipoProyecto)99, DocumentType.CertificacionIPI, cancellationToken);
                if (activeRules.Any())
                {
                    status = ProjectStatus.ConObservacion;
                }
            }
        }

        var oldStatus = proyecto.Estado?.CodigoUnico;
        var oldEstadoId = proyecto.EstadoId;
        var estado = await _proyectoRepository.GetEstadoByStatusAsync(status, cancellationToken);
        if (estado == null)
            throw new InvalidOperationException($"Estado {status} no encontrado.");
            
        proyecto.UpdateEstado(estado);
        
        _proyectoRepository.Update(proyecto);

        await _auditLogger.Append(new AuditEntryDto
        {
            UsuarioId = proyecto.UsuarioCreadorId,
            TipoOperacion = TipoOperacion.CambioEstado,
            Accion = "CambioEstado",
            Resultado = $"{oldStatus} → {status.ToCodigoUnico()}",
            ReferenciaExpedienteId = id,
            EstadoAnteriorId = oldEstadoId,
            EstadoNuevoId = estado.Id
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var tipoNotif = status switch
        {
            ProjectStatus.Publicado => TipoNotificacionId.ProyectoPublicado,
            ProjectStatus.ConObservacion => TipoNotificacionId.ProyectoObservacion,
            ProjectStatus.Revision => TipoNotificacionId.ProyectoEnRevision,
            _ => (int?)null
        };

        if (tipoNotif.HasValue)
        {
            var creator = await _usuarioRepository.GetByIdAsync(proyecto.UsuarioCreadorId, cancellationToken);
            if (creator != null)
                await NotifyProjectEvent(creator, proyecto, tipoNotif.Value,
                    $"Proyecto \"{proyecto.Nombre}\" cambió a {estado.Nombre}.",
                    proyecto.Id, "Proyecto", cancellationToken);
        }

        if (oldStatus != status.ToCodigoUnico() && (status == ProjectStatus.Publicado || status == ProjectStatus.ConObservacion))
        {
            var usuario = await _usuarioRepository.GetByIdAsync(proyecto.UsuarioCreadorId, cancellationToken);
            if (usuario != null && !string.IsNullOrWhiteSpace(usuario.Email))
            {
                // Fire and forget or await, depending on requirements. We await here for simplicity.
                await _emailNotificationService.SendProjectStatusChangeAsync(usuario.Email, proyecto, cancellationToken);
            }
        }

        return MapToDto(proyecto);
    }

    public async Task DeleteProjectAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            await _proyectoRepository.DeleteWithRelatedDataAsync(id, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (KeyNotFoundException)
        {
            throw;
        }
    }

    public async Task InteresarProyectoAsync(Guid proyectoId, Guid usuarioInteresadoId, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(proyectoId, cancellationToken);
        if (proyecto == null) throw new NotFoundException($"Proyecto {proyectoId} no encontrado.");
        if (proyecto.UsuarioCreadorId == usuarioInteresadoId) throw new BadRequestException("No puede interesarse en su propio proyecto.");

        var existing = await _proyectoRepository.GetInteresAsync(proyectoId, usuarioInteresadoId, cancellationToken);
        if (existing != null) return;

        var interes = new ProyectoInteresado(proyectoId, proyecto.UsuarioCreadorId, usuarioInteresadoId);
        await _proyectoRepository.AddInteresAsync(interes, cancellationToken);

        var log = new LogProyecto(usuarioInteresadoId, proyectoId, "Interés registrado en el proyecto.");
        await _proyectoRepository.AddLogProyectoAsync(log, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            var creador = await _usuarioRepository.GetByIdAsync(proyecto.UsuarioCreadorId, cancellationToken);
            var interesado = await _usuarioRepository.GetByIdAsync(usuarioInteresadoId, cancellationToken);
            if (creador != null && interesado != null)
            {
                var notif = await _notificationFactory.CreateAsync(creador.Id,
                    TipoNotificacionId.InteresRegistrado,
                    $"{interesado.NombreCompleto} mostró interés en \"{proyecto.Nombre}\".",
                    $"/admin/projects/{proyecto.Id}", proyecto.Id, "Proyecto", cancellationToken);
                await _notificacionRepository.AddAsync(notif, cancellationToken);

                if (!string.IsNullOrWhiteSpace(creador.Email))
                    await _emailNotificationService.SendInterestRegisteredAsync(creador.Email, proyecto, interesado.NombreCompleto, cancellationToken);
            }
        }
        catch (Exception)
        {
            // Ignore notification errors to prevent breaking the flow
        }
    }

    public async Task QuitarInteresProyectoAsync(Guid proyectoId, Guid usuarioInteresadoId, CancellationToken cancellationToken = default)
    {
        var existing = await _proyectoRepository.GetInteresAsync(proyectoId, usuarioInteresadoId, cancellationToken);
        if (existing == null) return;

        _proyectoRepository.RemoveInteres(existing);

        var log = new LogProyecto(usuarioInteresadoId, proyectoId, "Interés removido del proyecto.");
        await _proyectoRepository.AddLogProyectoAsync(log, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task GuardarProyectoAsync(Guid proyectoId, Guid usuarioGuardadorId, CancellationToken cancellationToken = default)
    {
        var proyecto = await _proyectoRepository.GetByIdAsync(proyectoId, cancellationToken);
        if (proyecto == null) throw new NotFoundException($"Proyecto {proyectoId} no encontrado.");

        var existing = await _proyectoRepository.GetGuardadoAsync(proyectoId, usuarioGuardadorId, cancellationToken);
        if (existing != null) return;

        var guardado = new ProyectoGuardado(proyectoId, proyecto.UsuarioCreadorId, usuarioGuardadorId);
        await _proyectoRepository.AddGuardadoAsync(guardado, cancellationToken);

        var log = new LogProyecto(usuarioGuardadorId, proyectoId, "Proyecto guardado en lista de seguimiento.");
        await _proyectoRepository.AddLogProyectoAsync(log, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task QuitarGuardadoProyectoAsync(Guid proyectoId, Guid usuarioGuardadorId, CancellationToken cancellationToken = default)
    {
        var existing = await _proyectoRepository.GetGuardadoAsync(proyectoId, usuarioGuardadorId, cancellationToken);
        if (existing == null) return;

        _proyectoRepository.RemoveGuardado(existing);

        var log = new LogProyecto(usuarioGuardadorId, proyectoId, "Proyecto removido de lista de guardados.");
        await _proyectoRepository.AddLogProyectoAsync(log, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<Application.DTOs.Projects.ProyectoInteresDto>> GetProyectosInteresesAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var misIntereses = await _proyectoRepository.GetInteresesByUsuarioAsync(usuarioId, cancellationToken);
        var interesadosEnMisProyectos = await _proyectoRepository.GetInteresadosInUserProjectsAsync(usuarioId, cancellationToken);

        var result = new List<Application.DTOs.Projects.ProyectoInteresDto>();

        foreach (var i in misIntereses)
        {
            result.Add(new Application.DTOs.Projects.ProyectoInteresDto(
                "Mis Intereses",
                i.ProjectId,
                i.Project.Nombre,
                i.CreatorId,
                i.Project.UsuarioCreador.NombreCompleto,
                i.Project.UsuarioCreador.AvatarUrl,
                i.CreatedAtUtc,
                i.Project.UsuarioCreador.Rnc ?? "",
                i.Project.UsuarioCreador.Direccion ?? "",
                i.Project.UsuarioCreador.Telefono ?? "",
                i.Project.UsuarioCreador.CorreoElectronico ?? "",
                i.Project.UsuarioCreador.Provincia ?? i.Project.UbicacionTexto ?? ""
            ));
        }

        foreach (var i in interesadosEnMisProyectos)
        {
            result.Add(new Application.DTOs.Projects.ProyectoInteresDto(
                "Interesados",
                i.ProjectId,
                i.Project.Nombre,
                i.InterestedUserId,
                i.InterestedUser.NombreCompleto,
                i.InterestedUser.AvatarUrl,
                i.CreatedAtUtc,
                i.InterestedUser.Rnc ?? "",
                i.InterestedUser.Direccion ?? "",
                i.InterestedUser.Telefono ?? "",
                i.InterestedUser.CorreoElectronico ?? "",
                i.Project.UsuarioCreador.Provincia ?? i.Project.UbicacionTexto ?? ""
            ));
        }

        return result.OrderByDescending(x => x.Fecha);
    }

    public async Task<IEnumerable<ProyectoDto>> GetProyectosGuardadosAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var guardados = await _proyectoRepository.GetGuardadosByUsuarioAsync(usuarioId, cancellationToken);
        return guardados.Select(g => MapToDto(g.Project));
    }

    private async Task<CategoriaProyecto> ValidateCategoriaAsync(int categoriaId, CancellationToken cancellationToken)
    {
        var categorias = await _proyectoRepository.GetCategoriasAsync(cancellationToken);
        var categoria = categorias.FirstOrDefault(c => c.Id == categoriaId);
        if (categoria == null || !categoria.Activo)
        {
            throw new ArgumentException(
                "La categoría seleccionada no existe o está inactiva.",
                nameof(Proyecto.CategoriaId));
        }

        return categoria;
    }

    /// <summary>
    /// Assembler: transforma el resultado del resolver de dominio en el contrato
    /// público de salida (la UI no conoce las reglas internas de presentación).
    /// </summary>
    private static ProjectRegistrantPublicPresentationDto ToPresentationDto(PublicPresentation presentation)
    {
        var tipo = presentation.IdentificacionTipo switch
        {
            IdentificacionPublicaModo.Cedula => "cedula",
            IdentificacionPublicaModo.Rnc => "rnc",
            _ => null
        };

        return new ProjectRegistrantPublicPresentationDto(
            presentation.NombreMostrado,
            presentation.IdentificacionMostrada,
            tipo,
            presentation.RazonSocialMostrada);
    }

    private static ProyectoDto MapToDto(Proyecto proyecto, int integridadValidada = 0)
    {
        ProjectRegistrantDto? registradoPor = null;
        if (proyecto.UsuarioCreador != null)
        {
            registradoPor = new ProjectRegistrantDto(
                proyecto.UsuarioCreador.Id,
                proyecto.UsuarioCreador.NombreCompleto,
                proyecto.UsuarioCreador.RazonSocial,
                proyecto.UsuarioCreador.Rol.ToString(),
                proyecto.UsuarioCreador.Email,
                proyecto.UsuarioCreador.Telefono,
                proyecto.UsuarioCreador.AvatarUrl,
                proyecto.UsuarioCreador.CreatedAtUtc,
                proyecto.UsuarioCreador.EmailVerificado,
                proyecto.UsuarioCreador.TitularId,
                ToPresentationDto(PublicIdentityResolver.Resolve(proyecto.UsuarioCreador, proyecto))
            );
        }

        return new ProyectoDto(
            proyecto.Id,
            proyecto.CodigoInterno,
            proyecto.Nombre,
            proyecto.UbicacionTexto,
            proyecto.UbicacionGps,
            proyecto.ImagenUrl,
            proyecto.ImagenAdicional1,
            proyecto.ImagenAdicional2,
            proyecto.ImagenAdicional3,
            proyecto.ImagenAdicional4,
            proyecto.ImagenAdicional5,
            proyecto.ValorEstimado,
            proyecto.CategoriaId,
            proyecto.CategoriaProyecto?.Nombre ?? "",
            proyecto.DatosDesarrollador,
            proyecto.RncDesarrollador,
            proyecto.DesignacionCatastral,
            proyecto.Matricula,
            proyecto.Propietario,
            proyecto.CedulaRncPropietario,
            proyecto.Ipi,
            proyecto.EstadoJuridico,
            proyecto.EstatusIpi,
            proyecto.SuperficieM2,
            proyecto.EstatusDescripcion,
            proyecto.Estado?.CodigoUnico ?? "Desconocido",
            proyecto.EstadoIntegridad,
            proyecto.UsuarioCreadorId,
            proyecto.CreatedAtUtc,
            proyecto.UpdatedAtUtc,
            registradoPor,
            proyecto.UsuarioCreador?.Plan?.NombrePlan,
            proyecto.ProvinciaId,
            proyecto.Provincia?.NombreProvincia,
            integridadValidada
        );
    }

    private async Task NotifyProjectEvent(Usuario creator, Proyecto proyecto, int tipoId,
        string mensaje, Guid entidadId, string entidadTipo, CancellationToken ct)
    {
        // ponytail: notify creator + titular if delegate
        var enlace = $"/admin/projects/{proyecto.Id}";
        var notif = await _notificationFactory.CreateAsync(
            creator.Id, tipoId, mensaje, enlace, entidadId, entidadTipo, ct);
        await _notificacionRepository.AddAsync(notif, ct);

        if (creator.TitularId.HasValue && creator.TitularId != creator.Id)
        {
            var titularNotif = await _notificationFactory.CreateAsync(
                creator.TitularId.Value, tipoId,
                $"{creator.NombreCompleto} — {mensaje}",
                enlace, entidadId, entidadTipo, ct);
            await _notificacionRepository.AddAsync(titularNotif, ct);
        }
    }
}
// test codebase-memory-mcp
