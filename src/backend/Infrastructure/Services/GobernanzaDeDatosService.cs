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

        Domain.Entities.DatoValidado datoValidadoToUse;

        if (existing != null)
        {
            existing.UpdateResultados(datosOcrJson, datosMatchJson, (double)result.MatchPercentage);
            _dbContext.DatosValidados.Update(existing);
            datoValidadoToUse = existing;
        }
        else
        {
            var newDato = new Domain.Entities.DatoValidado(request.ProyectoId, request.DocumentoId.Value, string.IsNullOrEmpty(request.TipoDocumento) ? "Desconocido" : request.TipoDocumento);
            newDato.UpdateResultados(datosOcrJson, datosMatchJson, (double)result.MatchPercentage);
            _dbContext.DatosValidados.Add(newDato);
            
            // Note: EF Core will populate ID upon save, but we need it for Hallazgo...
            // Wait, we can save changes first to get the ID, then add Hallazgos.
            await _dbContext.SaveChangesAsync();
            datoValidadoToUse = newDato;
        }

        // Process Hallazgos
        var currentHallazgos = await _dbContext.Hallazgos
            .Where(h => h.DatoValidadoId == datoValidadoToUse.Id)
            .ToListAsync();

        // Mark previously failed fields that are no longer failing as resolved
        var resolvedHallazgos = currentHallazgos.Where(h => !result.FailedFields.Contains(h.Campo ?? "")).ToList();
        foreach (var h in resolvedHallazgos)
        {
            if (!h.Resuelto)
            {
                h.MarkAsResolved();
                _dbContext.Hallazgos.Update(h);
            }
        }

        // Add or update currently failed fields
        foreach (var failedField in result.FailedFields)
        {
            var existingHallazgo = currentHallazgos.FirstOrDefault(h => h.Campo == failedField);
            if (existingHallazgo != null)
            {
                if (existingHallazgo.Resuelto)
                {
                    existingHallazgo.MarkAsUnresolved();
                    _dbContext.Hallazgos.Update(existingHallazgo);
                }
            }
            else
            {
                var newHallazgo = new Domain.Entities.Hallazgo(
                    request.ProyectoId,
                    datoValidadoToUse.Id,
                    failedField,
                    $"El campo {failedField} no coincide con la base de datos gubernamental.",
                    Domain.Enums.FindingSeverity.Medium
                );
                _dbContext.Hallazgos.Add(newHallazgo);
            }
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

        var totalDocumentos = await _dbContext.Documentos.CountAsync(d => d.ProyectoId == proyectoId);
        
        if (totalDocumentos > 0)
        {
            var datosValidados = await _dbContext.DatosValidados
                .Where(d => d.ProyectoId == proyectoId)
                .ToListAsync();

            double sumPorcentaje = datosValidados.Sum(d => d.PorcentajeTotal);
            double average = sumPorcentaje / totalDocumentos;

            var ipiNoPagado = !string.IsNullOrEmpty(proyecto.EstatusIpi) && proyecto.EstatusIpi == "PAGO_PENDIENTE";
            var ipiRuleActive = ipiNoPagado && await _dbContext.ReglasValidacion
                .AnyAsync(r => r.Activa && r.TipoDocumentoAplicable == Domain.Enums.DocumentType.CertificacionIPI);

            if (average < 50 && proyecto.Estado?.CodigoUnico != Domain.Enums.ProjectStatusCodes.Observacion)
            {
                var estadoConObservacion = await _dbContext.ProyectoEstados
                    .FirstOrDefaultAsync(e => e.CodigoUnico == Domain.Enums.ProjectStatusCodes.Observacion);

                if (estadoConObservacion != null)
                {
                    var prevEstatusId = proyecto.EstadoId;
                    proyecto.UpdateEstado(estadoConObservacion);
                    _dbContext.Proyectos.Update(proyecto);
                    
                    var auditoria = new Domain.Entities.Auditoria(
                        proyecto.UsuarioCreadorId,
                        Domain.Enums.TipoOperacion.CambioEstado,
                        "CambioEstado",
                        $"Proyecto pasa a Con Observaciones (En Riesgo). Promedio {average:F2}% (<50%) con {totalDocumentos} documentos.",
                        proyectoId,
                        null,
                        null,
                        prevEstatusId,
                        estadoConObservacion.Id
                    );
                    _dbContext.Auditorias.Add(auditoria);
                    await _dbContext.SaveChangesAsync();
                }
            }
            else if (average >= 50 && totalDocumentos >= 3 && proyecto.Estado?.CodigoUnico != Domain.Enums.ProjectStatusCodes.Publicado && !ipiRuleActive)
            {
                var estadoPublicado = await _dbContext.ProyectoEstados
                    .FirstOrDefaultAsync(e => e.CodigoUnico == Domain.Enums.ProjectStatusCodes.Publicado);

                if (estadoPublicado != null)
                {
                    var prevEstatusId = proyecto.EstadoId;
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
                        prevEstatusId,
                        estadoPublicado.Id
                    );
                    _dbContext.Auditorias.Add(auditoria);
                    await _dbContext.SaveChangesAsync();
                }
            }
            else if (average >= 50 && totalDocumentos < 3 && proyecto.Estado?.CodigoUnico != Domain.Enums.ProjectStatusCodes.Revision)
            {
                var estadoRevision = await _dbContext.ProyectoEstados
                    .FirstOrDefaultAsync(e => e.CodigoUnico == Domain.Enums.ProjectStatusCodes.Revision);

                if (estadoRevision != null)
                {
                    var prevEstatusId = proyecto.EstadoId;
                    proyecto.UpdateEstado(estadoRevision);
                    _dbContext.Proyectos.Update(proyecto);
                    
                    var auditoria = new Domain.Entities.Auditoria(
                        proyecto.UsuarioCreadorId,
                        Domain.Enums.TipoOperacion.CambioEstado,
                        "CambioEstado",
                        $"Proyecto pasa a En Revisión. Promedio {average:F2}% pero requiere 3 documentos para publicación (tiene {totalDocumentos}).",
                        proyectoId,
                        null,
                        null,
                        prevEstatusId,
                        estadoRevision.Id
                    );
                    _dbContext.Auditorias.Add(auditoria);
                    await _dbContext.SaveChangesAsync();
                }
            }
        }
    }

    private (int total, int matched) CompareStr(string? reqVal, string? dbVal)
    {
        if (reqVal == null) return (0, 0); // Not included in the request payload
        if (string.IsNullOrWhiteSpace(reqVal)) return (1, 0); // Included in payload but empty -> miss
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

    private (int total, int matched) CompareSuperficie(string? reqVal, decimal? dbVal)
    {
        if (reqVal == null) return (0, 0);
        if (string.IsNullOrWhiteSpace(reqVal)) return (1, 0);
        if (!decimal.TryParse(reqVal, out var reqDec)) return (1, 0);
        if (!dbVal.HasValue) return (1, 0);
        return (1, Math.Abs(reqDec - dbVal.Value) < 1m ? 1 : 0);
    }

    private (int total, int matched) CompareDate(string? reqVal, DateTime? dbVal)
    {
        if (reqVal == null) return (0, 0);
        if (string.IsNullOrWhiteSpace(reqVal)) return (1, 0);
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
            var mat = request.Matricula.Trim();
            entity = await _dbContext.CatastroTitulos.FirstOrDefaultAsync(c => c.Matricula == mat || (c.Matricula != null && c.Matricula.Contains(mat)));
        }
            
        if (entity == null && !string.IsNullOrEmpty(request.DesignacionCatastral))
        {
            var des = request.DesignacionCatastral.Trim();
            entity = await _dbContext.CatastroTitulos.FirstOrDefaultAsync(c => c.CodigoDesignacionCatastral == des || (c.CodigoDesignacionCatastral != null && c.CodigoDesignacionCatastral.Contains(des)));
        }

        if (entity != null)
        {
            var f1 = CompareStr(request.Matricula, entity.Matricula);
            var f2 = CompareStr(request.DesignacionCatastral, entity.CodigoDesignacionCatastral);

            // Se eliminó la validación cruzada relajada por solicitud del usuario: 
            // ambas variables (Matrícula y Designación) deben coincidir estrictamente con la base de datos si fueron enviadas.

            var f3 = CompareStr(request.Oficina, entity.Oficina);
            var f4 = CompareDate(request.FechaInscripcion, entity.FechaInscripcion);
            var f5 = CompareDate(request.FechaEmision, entity.FechaEmision);
            var f6 = CompareStr(request.VieneDe, entity.VieneDe);
            var f7 = CompareStr(request.DesignCatastralOrigen, entity.DesignCatastralOrigen);
            var f8 = CompareStr(request.DesigCatastralPosicional, entity.DesigCatastralPosicional);
            var f9 = CompareStr(request.Provincia, entity.Provincia);
            var f10 = CompareStr(request.Municipio, entity.Municipio);
            var f11 = CompareSuperficie(request.SuperficieM2, entity.Superficie);

            int total = f1.total + f2.total + f3.total + f4.total + f5.total + f6.total + f7.total + f8.total + f9.total + f10.total + f11.total;
            int matched = f1.matched + f2.matched + f3.matched + f4.matched + f5.matched + f6.matched + f7.matched + f8.matched + f9.matched + f10.matched + f11.matched;
            
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
                    entity.DesigCatastralPosicional,
                    entity.Provincia,
                    entity.Municipio
                }
            };
            
            if (f1.total == 1 && f1.matched == 0) res.FailedFields.Add("Matricula");
            if (f2.total == 1 && f2.matched == 0) res.FailedFields.Add("DesignacionCatastral");
            if (f3.total == 1 && f3.matched == 0) res.FailedFields.Add("Oficina");
            if (f4.total == 1 && f4.matched == 0) res.FailedFields.Add("FechaInscripcion");
            if (f5.total == 1 && f5.matched == 0) res.FailedFields.Add("FechaEmision");
            if (f6.total == 1 && f6.matched == 0) res.FailedFields.Add("VieneDe");
            if (f7.total == 1 && f7.matched == 0) res.FailedFields.Add("DesignCatastralOrigen");
            if (f8.total == 1 && f8.matched == 0) res.FailedFields.Add("DesigCatastralPosicional");
            if (f9.total == 1 && f9.matched == 0) res.FailedFields.Add("Provincia");
            if (f10.total == 1 && f10.matched == 0) res.FailedFields.Add("Municipio");
            if (f11.total == 1 && f11.matched == 0) res.FailedFields.Add("SuperficieM2");

            await SaveValidationResultAsync(request, res);
            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "" };
        if (!string.IsNullOrWhiteSpace(request.Matricula)) failRes.FailedFields.Add("Matricula");
        if (!string.IsNullOrWhiteSpace(request.DesignacionCatastral)) failRes.FailedFields.Add("DesignacionCatastral");
        if (!string.IsNullOrWhiteSpace(request.Oficina)) failRes.FailedFields.Add("Oficina");
        if (!string.IsNullOrWhiteSpace(request.FechaInscripcion)) failRes.FailedFields.Add("FechaInscripcion");
        if (!string.IsNullOrWhiteSpace(request.FechaEmision)) failRes.FailedFields.Add("FechaEmision");
        if (!string.IsNullOrWhiteSpace(request.VieneDe)) failRes.FailedFields.Add("VieneDe");
        if (!string.IsNullOrWhiteSpace(request.DesignCatastralOrigen)) failRes.FailedFields.Add("DesignCatastralOrigen");
        if (!string.IsNullOrWhiteSpace(request.DesigCatastralPosicional)) failRes.FailedFields.Add("DesigCatastralPosicional");
        if (!string.IsNullOrWhiteSpace(request.Provincia)) failRes.FailedFields.Add("Provincia");
        if (!string.IsNullOrWhiteSpace(request.Municipio)) failRes.FailedFields.Add("Municipio");
        if (!string.IsNullOrWhiteSpace(request.SuperficieM2)) failRes.FailedFields.Add("SuperficieM2");
        await SaveValidationResultAsync(request, failRes);
        return failRes;
    }

    public async Task<VerificationResult> VerificarJceAsync(JceVerificationRequest request)
    {
        var ced = request.Cedula?.Trim();
        var entity = await _dbContext.JCE_Ciudadanos
            .FirstOrDefaultAsync(c => c.Cedula == ced || (c.Cedula != null && ced != null && c.Cedula.Contains(ced)));

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

            if (f1.total == 1 && f1.matched == 0) res.FailedFields.Add("Cedula");
            if (f2.total == 1 && f2.matched == 0) res.FailedFields.Add("Nombres");
            if (f3.total == 1 && f3.matched == 0) res.FailedFields.Add("Apellidos");
            if (f4.total == 1 && f4.matched == 0) res.FailedFields.Add("FechaNacimiento");
            if (f5.total == 1 && f5.matched == 0) res.FailedFields.Add("FechaExpiracion");

            await SaveValidationResultAsync(request, res);
            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "" };
        if (!string.IsNullOrWhiteSpace(request.Cedula)) failRes.FailedFields.Add("Cedula");
        if (!string.IsNullOrWhiteSpace(request.Nombres)) failRes.FailedFields.Add("Nombres");
        if (!string.IsNullOrWhiteSpace(request.Apellidos)) failRes.FailedFields.Add("Apellidos");
        if (!string.IsNullOrWhiteSpace(request.FechaNacimiento)) failRes.FailedFields.Add("FechaNacimiento");
        if (!string.IsNullOrWhiteSpace(request.FechaExpiracion)) failRes.FailedFields.Add("FechaExpiracion");
        await SaveValidationResultAsync(request, failRes);
        return failRes;
    }

    public async Task<VerificationResult> VerificarDgiiAsync(DgiiVerificationRequest request)
    {
        var rnc = request.Rnc?.Trim();
        var entity = await _dbContext.DGII
            .FirstOrDefaultAsync(d => d.Rnc == rnc || (d.Rnc != null && rnc != null && d.Rnc.Contains(rnc)));

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

            if (f1.total == 1 && f1.matched == 0) res.FailedFields.Add("Rnc");
            if (f2.total == 1 && f2.matched == 0) res.FailedFields.Add("NombreRazonSocial");
            if (f3.total == 1 && f3.matched == 0) res.FailedFields.Add("ActividadEconomica");

            await SaveValidationResultAsync(request, res);
            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "RNC no registrado en la DGII." };
        if (!string.IsNullOrWhiteSpace(request.Rnc)) failRes.FailedFields.Add("Rnc");
        if (!string.IsNullOrWhiteSpace(request.NombreRazonSocial)) failRes.FailedFields.Add("NombreRazonSocial");
        if (!string.IsNullOrWhiteSpace(request.ActividadEconomica)) failRes.FailedFields.Add("ActividadEconomica");
        await SaveValidationResultAsync(request, failRes);
        return failRes;
    }

    public async Task<VerificationResult> VerificarPermisoSueloAsync(PermisoSueloVerificationRequest request)
    {
        Domain.Entities.PermisoSuelo? entity = null;
        
        if (!string.IsNullOrEmpty(request.NumeroPermiso))
        {
            var perm = request.NumeroPermiso.Trim();
            entity = await _dbContext.PermisosSuelo.FirstOrDefaultAsync(p => p.NumeroPermiso == perm || (p.NumeroPermiso != null && p.NumeroPermiso.Contains(perm)));
        }

        if (entity == null && !string.IsNullOrEmpty(request.Rnc))
        {
            var rnc = request.Rnc.Trim();
            entity = await _dbContext.PermisosSuelo.FirstOrDefaultAsync(p => p.Rnc == rnc || (p.Rnc != null && p.Rnc.Contains(rnc)));
        }

        if (entity != null)
        {
            var f1 = CompareStr(request.NumeroPermiso, entity.NumeroPermiso);
            var f2 = CompareStr(request.NumeroExpediente, entity.NumeroExpediente);
            var f3 = CompareStr(request.Rnc, entity.Rnc);

            if (f1.matched == 1 || f3.matched == 1)
            {
                if (f1.total > 0 && f1.matched == 0) f1.matched = 1;
                if (f3.total > 0 && f3.matched == 0) f3.matched = 1;
            }

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

            if (f1.total == 1 && f1.matched == 0) res.FailedFields.Add("NumeroPermiso");
            if (f2.total == 1 && f2.matched == 0) res.FailedFields.Add("NumeroExpediente");
            if (f3.total == 1 && f3.matched == 0) res.FailedFields.Add("Rnc");
            if (f4.total == 1 && f4.matched == 0) res.FailedFields.Add("Departamento");
            if (f5.total == 1 && f5.matched == 0) res.FailedFields.Add("Operacion");
            if (f6.total == 1 && f6.matched == 0) res.FailedFields.Add("Seccion");
            if (f7.total == 1 && f7.matched == 0) res.FailedFields.Add("Lugar");

            await SaveValidationResultAsync(request, res);
            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "Permiso de suelo no encontrado." };
        if (!string.IsNullOrWhiteSpace(request.NumeroPermiso)) failRes.FailedFields.Add("NumeroPermiso");
        if (!string.IsNullOrWhiteSpace(request.NumeroExpediente)) failRes.FailedFields.Add("NumeroExpediente");
        if (!string.IsNullOrWhiteSpace(request.Rnc)) failRes.FailedFields.Add("Rnc");
        if (!string.IsNullOrWhiteSpace(request.Departamento)) failRes.FailedFields.Add("Departamento");
        if (!string.IsNullOrWhiteSpace(request.Operacion)) failRes.FailedFields.Add("Operacion");
        if (!string.IsNullOrWhiteSpace(request.Seccion)) failRes.FailedFields.Add("Seccion");
        if (!string.IsNullOrWhiteSpace(request.Lugar)) failRes.FailedFields.Add("Lugar");
        await SaveValidationResultAsync(request, failRes);
        return failRes;
    }

    public async Task<VerificationResult> VerificarIpiAsync(IpiVerificationRequest request)
    {
        Domain.Entities.PagoIPI? entity = null;
        
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
                Message = percentage >= 99m ? "Certificación de IPI verificada." : $"Certificación de IPI validada parcialmente ({percentage}%).",
                MatchedData = new { entity.Rnc, entity.NoCertificacion, entity.NoInmueble, entity.ParcelaNo, entity.Estatus }
            };

            if (f1.total == 1 && f1.matched == 0) res.FailedFields.Add("Rnc");
            if (f2.total == 1 && f2.matched == 0) res.FailedFields.Add("NoCertificacion");
            if (f3.total == 1 && f3.matched == 0) res.FailedFields.Add("NoInmueble");
            if (f4.total == 1 && f4.matched == 0) res.FailedFields.Add("ParcelaNo");

            await SaveValidationResultAsync(request, res);

            if (res.IsValid)
                await UpdateIpiStatusAsync(request.ProyectoId, entity.Estatus);

            return res;
        }

        var failRes = new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "Certificación de IPI no encontrada o no válida." };
        if (!string.IsNullOrWhiteSpace(request.Rnc)) failRes.FailedFields.Add("Rnc");
        if (!string.IsNullOrWhiteSpace(request.NoCertificacion)) failRes.FailedFields.Add("NoCertificacion");
        if (!string.IsNullOrWhiteSpace(request.NoInmueble)) failRes.FailedFields.Add("NoInmueble");
        if (!string.IsNullOrWhiteSpace(request.ParcelaNo)) failRes.FailedFields.Add("ParcelaNo");
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
