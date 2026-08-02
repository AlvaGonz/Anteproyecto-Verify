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
            return new VerificationResult
            {
                IsValid = true,
                MatchPercentage = 100m,
                Message = "Verificación exitosa en Catastro.",
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
            return new VerificationResult
            {
                IsValid = true,
                MatchPercentage = 100m,
                Message = "Ciudadano validado correctamente.",
                MatchedData = new { entity.Cedula, entity.Nombres, entity.Apellidos, entity.FechaNacimiento }
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
            return new VerificationResult
            {
                IsValid = true,
                MatchPercentage = 100m,
                Message = "RNC Validado correctamente en la DGII.",
                MatchedData = new { entity.Rnc, entity.NombreRazonSocial, entity.Estado }
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
            return new VerificationResult
            {
                IsValid = true,
                MatchPercentage = 100m,
                Message = "Permiso de uso de suelo verificado.",
                MatchedData = new { entity.NumeroPermiso, entity.TienePermiso, entity.Departamento, entity.Operacion }
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
            return new VerificationResult
            {
                IsValid = true,
                MatchPercentage = 100m,
                Message = "Certificación de IPI validada.",
                MatchedData = new { entity.Rnc, entity.Cuota_ipi, entity.Estatus, entity.NoCertificacion, entity.NoInmueble }
            };
        }

        return new VerificationResult { IsValid = false, MatchPercentage = 0m, Message = "Certificación de IPI no encontrada o no válida." };
    }
}
