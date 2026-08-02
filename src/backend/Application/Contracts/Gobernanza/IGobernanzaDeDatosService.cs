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

public class VerificationResult
{
    public bool IsValid { get; set; }
    public decimal MatchPercentage { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? MatchedData { get; set; }
}

public class CatastroVerificationRequest
{
    public string? Matricula { get; set; }
    public string? DesignacionCatastral { get; set; }
    public string? Oficina { get; set; }
    
    // Nuevas variables
    public DateTime? FechaInscripcion { get; set; }
    public DateTime? FechaEmision { get; set; }
    public string? VieneDe { get; set; }
    public string? DesignCatastralOrigen { get; set; }
    public string? DesigCatastralPosicional { get; set; }
}

public class JceVerificationRequest
{
    public string? Cedula { get; set; }
    public string? Nombres { get; set; }
    public string? Apellidos { get; set; }
}

public class DgiiVerificationRequest
{
    public string? Rnc { get; set; }
    public string? RazonSocial { get; set; }
}

public class PermisoSueloVerificationRequest
{
    public string? NumeroPermiso { get; set; }
    public string? Rnc { get; set; }
    public string? Departamento { get; set; }
}

public class IpiVerificationRequest
{
    public string? Rnc { get; set; }
    public string? NoCertificacion { get; set; }
    public string? NoInmueble { get; set; }
}
