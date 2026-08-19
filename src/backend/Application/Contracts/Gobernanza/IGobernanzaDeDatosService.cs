using System.Threading.Tasks;

namespace Application.Contracts.Gobernanza;

public interface IGobernanzaDeDatosService
{
    Task<VerificationResult> VerificarCatastroAsync(CatastroVerificationRequest request);
    Task<VerificationResult> VerificarJceAsync(JceVerificationRequest request);
    Task<VerificationResult> VerificarDgiiAsync(DgiiVerificationRequest request);
    Task<VerificationResult> VerificarPermisoSueloAsync(PermisoSueloVerificationRequest request);
    Task<VerificationResult> VerificarIpiAsync(IpiVerificationRequest request);
}

public class DiscrepancyCheckResult
{
    public string Status { get; set; } = "executed";
    public string? Reason { get; set; }
    public bool? HasDiscrepancies { get; set; }
    public List<string> Findings { get; set; } = new();
}

public class VerificationResult
{
    public bool IsValid { get; set; }
    public decimal MatchPercentage { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? MatchedData { get; set; }
    public List<string> FailedFields { get; set; } = new();
    public DiscrepancyCheckResult? DiscrepancyCheck { get; set; }
}

public class BaseVerificationRequest
{
    public Guid ProyectoId { get; set; }
    public Guid? DocumentoId { get; set; }
    public string TipoDocumento { get; set; } = string.Empty;
}

public class CatastroVerificationRequest : BaseVerificationRequest
{
    public string? Matricula { get; set; }
    public string? DesignacionCatastral { get; set; }
    public string? Oficina { get; set; }
    
    // Nuevas variables
    public string? FechaInscripcion { get; set; }
    public string? FechaEmision { get; set; }
    public string? VieneDe { get; set; }
    public string? DesignCatastralOrigen { get; set; }
    public string? DesigCatastralPosicional { get; set; }
    public string? Provincia { get; set; }
    public string? Municipio { get; set; }
    public string? SuperficieM2 { get; set; }
}

public class JceVerificationRequest : BaseVerificationRequest
{
    public string? Cedula { get; set; }
    public string? Nombres { get; set; }
    public string? Apellidos { get; set; }
    public string? FechaNacimiento { get; set; }
    public string? FechaExpiracion { get; set; }
}

public class DgiiVerificationRequest : BaseVerificationRequest
{
    public string? Rnc { get; set; }
    public string? NombreRazonSocial { get; set; }
    public string? ActividadEconomica { get; set; }
}

public class PermisoSueloVerificationRequest : BaseVerificationRequest
{
    public string? NumeroPermiso { get; set; }
    public string? NumeroExpediente { get; set; }
    public string? Rnc { get; set; }
    public string? Departamento { get; set; }
    public string? Operacion { get; set; }
    public string? Seccion { get; set; }
    public string? Lugar { get; set; }
}

public class IpiVerificationRequest : BaseVerificationRequest
{
    public string? Rnc { get; set; }
    public string? NoCertificacion { get; set; }
    public string? NoInmueble { get; set; }
    public string? ParcelaNo { get; set; }
}
