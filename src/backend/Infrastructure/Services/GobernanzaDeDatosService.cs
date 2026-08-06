using System;
using System.Linq;
using System.Threading.Tasks;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Application.Contracts.Gobernanza;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class GobernanzaDeDatosService : IGobernanzaDeDatosService
{
    private readonly AppDbContext _dbContext;
    private readonly INotificationFactory _notificationFactory;
    private readonly INotificacionRepository _notificacionRepository;

    public GobernanzaDeDatosService(
        AppDbContext dbContext,
        INotificationFactory notificationFactory,
        INotificacionRepository notificacionRepository)
    {
        _dbContext = dbContext;
        _notificationFactory = notificationFactory;
        _notificacionRepository = notificacionRepository;
    }

    private async Task SaveValidationResultAsync(BaseVerificationRequest request, VerificationResult result)
    {
        if (request.ProyectoId == Guid.Empty || !request.DocumentoId.HasValue) return;

        var jsonOptions = new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase };
        string datosOcrJson = System.Text.Json.JsonSerializer.Serialize((object)request, jsonOptions);
        string datosMatchJson = System.Text.Json.JsonSerializer.Serialize(result.MatchedData ?? new {}, jsonOptions);

        var existing = await _dbContext.DatosValidados
            .FirstOrDefaultAsync(d => d.ProyectoId == request.ProyectoId && d.DocumentoId == request.DocumentoId);

        if (existing != null)
        {
            existing.UpdateResultados(datosOcrJson, datosMatchJson, (double)result.MatchPercentage);
            _dbContext.DatosValidados.Update(existing);
        }
        else
        {
            var newDato = new Domain.Entities.DatoValidado(request.ProyectoId, request.DocumentoId.Value, string.IsNullOrEmpty(request.TipoDocumento) ? "Desconocido" : request.TipoDocumento);
            newDato.UpdateResultados(datosOcrJson, datosMatchJson, (double)result.MatchPercentage);
            _dbContext.DatosValidados.Add(newDato);
        }

        await _dbContext.SaveChangesAsync();

        await EvaluateAutoPublishAsync(request.ProyectoId);
    }

    private async Task EvaluateAutoPublishAsync(Guid proyectoId)
    {
        var proyecto = await _dbContext.Proyectos
            .Include(p => p.Estado)
            .FirstOrDefaultAsync(p => p.Id == proyectoId);

        if (proyecto == null) return;
        
        // Si ya está publicado, no hacemos nada
        if (proyecto.Estado?.CodigoUnico == Domain.Enums.ProjectStatusCodes.Publicado) return;

        var totalDocumentos = await _dbContext.Documentos.CountAsync(d => d.ProyectoId == proyectoId);
        
        // Debe haber subido al menos 3 documentos
        if (totalDocumentos >= 3)
        {
            var datosValidados = await _dbContext.DatosValidados
                .Where(d => d.ProyectoId == proyectoId)
                .ToListAsync();

            // El puntaje total de los documentos asociados en la variable [PorcentajeTotal] 
            // debe ser igual o mayor a 50 porcciento de TODOs los subidos a ese proyecto.
            double sumPorcentaje = datosValidados.Sum(d => d.PorcentajeTotal);
            double average = totalDocumentos > 0 ? sumPorcentaje / totalDocumentos : 0;

            if (average >= 50)
            {
                var estadoPublicado = await _dbContext.ProyectoEstados
                    .FirstOrDefaultAsync(e => e.CodigoUnico == Domain.Enums.ProjectStatusCodes.Publicado);

                if (estadoPublicado != null)
                {
                    proyecto.UpdateEstado(estadoPublicado);
                    _dbContext.Proyectos.Update(proyecto);
                    
                    var auditoria = new Domain.Entities.Auditoria(
                        proyecto.UsuarioCreadorId,
                        Domain.Enums.TipoOperacion.CambioEstado,
                        "CambioEstado",
                        $"Auto-Publicación por Validaciones. Promedio {average:F2}% (>=50%) con {totalDocumentos} documentos.",
                        proyectoId,
                        null,
                        null,
                        proyecto.EstadoId,
                        estadoPublicado.Id
                    );
                    _dbContext.Auditorias.Add(auditoria);
                    
                    await _dbContext.SaveChangesAsync();
                }
            }
        }
    }

    private (int total, int matched) CompareStr(string? reqVal, string? dbVal)
    {
        if (string.IsNullOrWhiteSpace(reqVal)) return (0, 0);
        var r = reqVal.Trim().ToLowerInvariant();
        var d = (dbVal ?? "").Trim().ToLowerInvariant();
        bool isMatch = d.Contains(r) || r.Contains(d) || r == d;
        return (1, isMatch ? 1 : 0);
    }

    private (int total, int matched) CompareDec(decimal? reqVal, decimal? dbVal)
    {
        if (!reqVal.HasValue) return (0, 0);
        if (!dbVal.HasValue) return (1, 0);
        return (1, reqVal.Value == dbVal.Value ? 1 : 0);
    }

    private (int total, int matched) CompareDate(string? reqVal, DateTime? dbVal)
    {
        if (string.IsNullOrWhiteSpace(reqVal)) return (0, 0);
        if (dbVal == null) return (1, 0);
        var r = reqVal.Trim();
        var d = dbVal.Value.ToString("yyyy-MM-dd");
        return (1, r.StartsWith(d) || d.StartsWith(r) ? 1 : 0);
    }

    public async Task<VerificationResult> VerificarCatastroAsync(CatastroVerificationRequest request)
    {
        Domain.Entities.CatastroTitulo? entity = null;

        if (!string.IsNullOrEmpty(request.Matricula))
        {
            entity = await _dbContext.CatastroTitulos.FirstOrDefaultAsync(c => c.Matricula == request.Matricula);
        }
            
        if (entity == null && !string.IsNullOrEmpty(request.DesignacionCatastral))
        {
            entity = await _dbContext.CatastroTitulos.FirstOrDefaultAsync(c => c.CodigoDesignacionCatastral == request.DesignacionCatastral);
        }

        if (entity != null)
        {
            var f1 = CompareStr(request.Matricula, entity.Matricula);
            var f2 = CompareStr(request.DesignacionCatastral, entity.CodigoDesignacionCatastral);
            var f3 = CompareStr(request.Oficina, entity.Oficina);
            var f4 = CompareDate(request.FechaInscripcion, entity.FechaInscripcion);
            var f5 = CompareDate(request.FechaEmision, entity.FechaEmision);
            var f6 = CompareStr(request.VieneDe, entity.VieneDe);
            var f7 = CompareStr(request.DesignCatastralOrigen, entity.DesignCatastralOrigen);
            var f8 = CompareStr(request.DesigCatastralPosicional, entity.DesigCatastralPosicional);

            int total = f1.total + f2.total + f3.total + f4.total + f5.total + f6.total + f7.total + f8.total;
            int matched = f1.matched + f2.matched + f3.matched + f4.matched + f5.matched + f6.matched + f7.matched + f8.matched;
            
            decimal percentage = total == 0 ? 100m : Math.Round((decimal)matched / total * 100m, 2);

            var res = new VerificationResult
            {
                IsValid = percentage >= 60m,
                MatchPercentage = percentage,
                Message = percentage >= 99m ? "Verificación exitosa en Catastro." : $"Verificación parcial ({percentage}%).",
                MatchedData = new { 
                    entity.Matricula, 
                    entity.CodigoDesignacionCatastral, 
                    entity.Oficina, 
                    entity.Superficie,
                    entity.FechaInscripcion,
                    entity.FechaEmision,
                    entity.VieneDe,
                    entity.DesignCatastralOrigen,
                    entity.DesigCatastralPosicional
                }
            };
            await SaveValidationResultAsync(request, res);
            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "No se encontraron coincidencias en Catastro." };
        await SaveValidationResultAsync(request, failRes);
        return failRes;
    }

    public async Task<VerificationResult> VerificarJceAsync(JceVerificationRequest request)
    {
        var entity = await _dbContext.JCE_Ciudadanos
            .FirstOrDefaultAsync(c => c.Cedula == request.Cedula);

        if (entity != null)
        {
            var f1 = CompareStr(request.Cedula, entity.Cedula);
            var f2 = CompareStr(request.Nombres, entity.Nombres);
            var f3 = CompareStr(request.Apellidos, entity.Apellidos);
            var f4 = CompareDate(request.FechaNacimiento, entity.FechaNacimiento);
            var f5 = CompareDate(request.FechaExpiracion, entity.FechaExpiracion);

            int total = f1.total + f2.total + f3.total + f4.total + f5.total;
            int matched = f1.matched + f2.matched + f3.matched + f4.matched + f5.matched;

            decimal percentage = total == 0 ? 100m : Math.Round((decimal)matched / total * 100m, 2);

            var res = new VerificationResult
            {
                IsValid = percentage >= 60m,
                MatchPercentage = percentage,
                Message = percentage >= 99m ? "Ciudadano validado correctamente." : $"Ciudadano validado parcialmente ({percentage}%).",
                MatchedData = new { entity.Cedula, entity.Nombres, entity.Apellidos, entity.FechaNacimiento, entity.FechaExpiracion }
            };
            await SaveValidationResultAsync(request, res);
            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "Cédula no encontrada en el padrón de la JCE." };
        await SaveValidationResultAsync(request, failRes);
        return failRes;
    }

    public async Task<VerificationResult> VerificarDgiiAsync(DgiiVerificationRequest request)
    {
        var entity = await _dbContext.DGII
            .FirstOrDefaultAsync(d => d.Rnc == request.Rnc);

        if (entity != null)
        {
            var f1 = CompareStr(request.Rnc, entity.Rnc);
            var f2 = CompareStr(request.NombreRazonSocial, entity.NombreRazonSocial);
            var f3 = CompareStr(request.ActividadEconomica, entity.ActividadEconomica);

            int total = f1.total + f2.total + f3.total;
            int matched = f1.matched + f2.matched + f3.matched;

            decimal percentage = total == 0 ? 100m : Math.Round((decimal)matched / total * 100m, 2);

            var res = new VerificationResult
            {
                IsValid = percentage >= 60m,
                MatchPercentage = percentage,
                Message = percentage >= 99m ? "RNC Validado correctamente en la DGII." : $"RNC validado parcialmente ({percentage}%).",
                MatchedData = new { entity.Rnc, entity.NombreRazonSocial, entity.ActividadEconomica, entity.Estado }
            };
            await SaveValidationResultAsync(request, res);
            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "RNC no registrado en la DGII." };
        await SaveValidationResultAsync(request, failRes);
        return failRes;
    }

    public async Task<VerificationResult> VerificarPermisoSueloAsync(PermisoSueloVerificationRequest request)
    {
        Domain.Entities.PermisoSuelo entity = null;
        
        if (!string.IsNullOrEmpty(request.NumeroPermiso))
        {
            entity = await _dbContext.PermisosSuelo.FirstOrDefaultAsync(p => p.NumeroPermiso == request.NumeroPermiso);
        }

        if (entity == null && !string.IsNullOrEmpty(request.Rnc))
        {
            entity = await _dbContext.PermisosSuelo.FirstOrDefaultAsync(p => p.Rnc == request.Rnc);
        }

        if (entity != null)
        {
            var f1 = CompareStr(request.NumeroPermiso, entity.NumeroPermiso);
            var f2 = CompareStr(request.NumeroExpediente, entity.NumeroExpediente);
            var f3 = CompareStr(request.Rnc, entity.Rnc);
            var f4 = CompareStr(request.Departamento, entity.Departamento);
            var f5 = CompareStr(request.Operacion, entity.Operacion);
            var f6 = CompareStr(request.Seccion, entity.Seccion);
            var f7 = CompareStr(request.Lugar, entity.Lugar);

            int total = f1.total + f2.total + f3.total + f4.total + f5.total + f6.total + f7.total;
            int matched = f1.matched + f2.matched + f3.matched + f4.matched + f5.matched + f6.matched + f7.matched;

            decimal percentage = total == 0 ? 100m : Math.Round((decimal)matched / total * 100m, 2);

            var res = new VerificationResult
            {
                IsValid = percentage >= 60m,
                MatchPercentage = percentage,
                Message = percentage >= 99m ? "Permiso de uso de suelo verificado." : $"Permiso de uso de suelo validado parcialmente ({percentage}%).",
                MatchedData = new { entity.NumeroPermiso, entity.TienePermiso, entity.Departamento, entity.Operacion, entity.Seccion, entity.Lugar }
            };
            await SaveValidationResultAsync(request, res);
            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "Permiso de suelo no encontrado." };
        await SaveValidationResultAsync(request, failRes);
        return failRes;
    }

    public async Task<VerificationResult> VerificarIpiAsync(IpiVerificationRequest request)
    {
        Domain.Entities.PagoIPI entity = null;
        
        if (!string.IsNullOrEmpty(request.NoCertificacion))
        {
            entity = await _dbContext.PagosIPI.FirstOrDefaultAsync(p => p.NoCertificacion == request.NoCertificacion);
        }

        if (entity == null && !string.IsNullOrEmpty(request.Rnc))
        {
            entity = await _dbContext.PagosIPI.FirstOrDefaultAsync(p => p.Rnc == request.Rnc);
        }

        if (entity != null)
        {
            var f1 = CompareStr(request.Rnc, entity.Rnc);
            var f2 = CompareStr(request.NoCertificacion, entity.NoCertificacion);
            var f3 = CompareStr(request.NoInmueble, entity.NoInmueble);
            var f4 = CompareStr(request.ParcelaNo, entity.ParcelaNo);

            int total = f1.total + f2.total + f3.total + f4.total;
            int matched = f1.matched + f2.matched + f3.matched + f4.matched;

            decimal percentage = total == 0 ? 100m : Math.Round((decimal)matched / total * 100m, 2);

            var res = new VerificationResult
            {
                IsValid = percentage >= 60m,
                MatchPercentage = percentage,
                Message = percentage >= 99m ? "Certificación de IPI validada." : $"Certificación de IPI validada parcialmente ({percentage}%).",
                MatchedData = new { entity.Rnc, entity.Cuota_ipi, entity.Estatus, entity.NoCertificacion, entity.NoInmueble, entity.ParcelaNo }
            };
            await SaveValidationResultAsync(request, res);

            if (res.IsValid)
                await UpdateIpiStatusAsync(request.ProyectoId, entity.Estatus);

            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "Certificación de IPI no encontrada o no válida." };
        await SaveValidationResultAsync(request, failRes);
        return failRes;
    }

    private async Task UpdateIpiStatusAsync(Guid proyectoId, string estatusIpi, CancellationToken ct = default)
    {
        var proyecto = await _dbContext.Proyectos.FirstOrDefaultAsync(p => p.Id == proyectoId);
        if (proyecto == null) return;

        var prevStatus = proyecto.EstatusIpi;
        var mappedStatus = MapIpiEstatus(estatusIpi);
        if (mappedStatus == null || mappedStatus == prevStatus) return;

        proyecto.UpdateEstatusIpi(mappedStatus);
        await _dbContext.SaveChangesAsync();

        if (mappedStatus == "PAGO_PENDIENTE")
        {
            var alreadyNotified = await _dbContext.Notificaciones.AnyAsync(n =>
                n.TipoNotificacionId == Domain.Enums.TipoNotificacionId.IpiPendiente &&
                n.EntidadReferenciaId == proyectoId);

            if (!alreadyNotified)
                await NotifyIpiAlertAsync(proyecto, Domain.Enums.TipoNotificacionId.IpiPendiente,
                    $"Deuda IPI detectada en \"{proyecto.Nombre}\".", ct);
        }
        else if (mappedStatus == "AL_DIA" && prevStatus == "PAGO_PENDIENTE")
        {
            await NotifyIpiAlertAsync(proyecto, Domain.Enums.TipoNotificacionId.IpiResuelto,
                $"Deuda IPI resuelta en \"{proyecto.Nombre}\".", ct);
        }
    }

    private static string? MapIpiEstatus(string rawStatus) => rawStatus switch
    {
        "No Pagado" => "PAGO_PENDIENTE",
        "Pagado" => "AL_DIA",
        _ => null
    };

    private async Task NotifyIpiAlertAsync(Domain.Entities.Proyecto proyecto, int tipoId, string mensaje, CancellationToken ct)
    {
        var enlace = $"/admin/projects/{proyecto.Id}";

        var notif = await _notificationFactory.CreateAsync(proyecto.UsuarioCreadorId, tipoId,
            mensaje, enlace, proyecto.Id, "Proyecto", ct);
        await _notificacionRepository.AddAsync(notif, ct);

        var admins = await _dbContext.Usuarios
            .Where(u => u.Rol == Domain.Enums.UserRole.Administrator && u.Activo)
            .ToListAsync();
        foreach (var admin in admins)
        {
            var adminNotif = await _notificationFactory.CreateAsync(admin.Id, tipoId,
                $"[Admin] {mensaje}", enlace, proyecto.Id, "Proyecto", ct);
            await _notificacionRepository.AddAsync(adminNotif, ct);
        }
    }
}
