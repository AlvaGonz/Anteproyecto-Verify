using System;
using System.Linq;
using System.Threading.Tasks;
using Application.Contracts.Gobernanza;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class GobernanzaDeDatosService : IGobernanzaDeDatosService
{
    private readonly AppDbContext _dbContext;

    public GobernanzaDeDatosService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
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
        var query = _dbContext.CatastroTitulos.AsQueryable();

        if (!string.IsNullOrEmpty(request.Matricula))
            query = query.Where(c => c.Matricula == request.Matricula);
            
        if (!string.IsNullOrEmpty(request.DesignacionCatastral))
            query = query.Where(c => c.CodigoDesignacionCatastral == request.DesignacionCatastral);
            
        var entity = await query.FirstOrDefaultAsync();

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

            return new VerificationResult
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
        }

        return new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "No se encontraron coincidencias en Catastro." };
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

            return new VerificationResult
            {
                IsValid = percentage >= 60m,
                MatchPercentage = percentage,
                Message = percentage >= 99m ? "Ciudadano validado correctamente." : $"Ciudadano validado parcialmente ({percentage}%).",
                MatchedData = new { entity.Cedula, entity.Nombres, entity.Apellidos, entity.FechaNacimiento, entity.FechaExpiracion }
            };
        }

        return new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "Cédula no encontrada en el padrón de la JCE." };
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

            return new VerificationResult
            {
                IsValid = percentage >= 60m,
                MatchPercentage = percentage,
                Message = percentage >= 99m ? "RNC Validado correctamente en la DGII." : $"RNC validado parcialmente ({percentage}%).",
                MatchedData = new { entity.Rnc, entity.NombreRazonSocial, entity.ActividadEconomica, entity.Estado }
            };
        }

        return new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "RNC no registrado en la DGII." };
    }

    public async Task<VerificationResult> VerificarPermisoSueloAsync(PermisoSueloVerificationRequest request)
    {
        var entity = await _dbContext.PermisosSuelo
            .FirstOrDefaultAsync(p => p.NumeroPermiso == request.NumeroPermiso || (p.Rnc == request.Rnc && request.Rnc != null));

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

            return new VerificationResult
            {
                IsValid = percentage >= 60m,
                MatchPercentage = percentage,
                Message = percentage >= 99m ? "Permiso de uso de suelo verificado." : $"Permiso de uso de suelo validado parcialmente ({percentage}%).",
                MatchedData = new { entity.NumeroPermiso, entity.TienePermiso, entity.Departamento, entity.Operacion, entity.Seccion, entity.Lugar }
            };
        }

        return new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "Permiso de suelo no encontrado." };
    }

    public async Task<VerificationResult> VerificarIpiAsync(IpiVerificationRequest request)
    {
        var entity = await _dbContext.PagosIPI
            .FirstOrDefaultAsync(p => p.NoCertificacion == request.NoCertificacion || (p.Rnc == request.Rnc && request.Rnc != null));

        if (entity != null)
        {
            var f1 = CompareStr(request.Rnc, entity.Rnc);
            var f2 = CompareStr(request.NoCertificacion, entity.NoCertificacion);
            var f3 = CompareStr(request.NoInmueble, entity.NoInmueble);
            var f4 = CompareStr(request.ParcelaNo, entity.ParcelaNo);

            int total = f1.total + f2.total + f3.total + f4.total;
            int matched = f1.matched + f2.matched + f3.matched + f4.matched;

            decimal percentage = total == 0 ? 100m : Math.Round((decimal)matched / total * 100m, 2);

            return new VerificationResult
            {
                IsValid = percentage >= 60m,
                MatchPercentage = percentage,
                Message = percentage >= 99m ? "Certificación de IPI validada." : $"Certificación de IPI validada parcialmente ({percentage}%).",
                MatchedData = new { entity.Rnc, entity.Cuota_ipi, entity.Estatus, entity.NoCertificacion, entity.NoInmueble, entity.ParcelaNo }
            };
        }

        return new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "Certificación de IPI no encontrada o no válida." };
    }
}
