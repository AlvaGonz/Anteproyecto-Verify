namespace Application.Abstractions.Reports;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

public class ReporteHallazgosDto
{
    public Guid ProyectoId { get; set; }
    public string NombreProyecto { get; set; } = string.Empty;
    public string CodigoInterno { get; set; } = string.Empty;
    public string UbicacionTexto { get; set; } = string.Empty;
    public decimal? ValorEstimado { get; set; }
    public string? DatosDesarrollador { get; set; }
    public string? RncDesarrollador { get; set; }
    public string? Matricula { get; set; }
    public string? DesignacionCatastral { get; set; }
    public decimal? SuperficieM2 { get; set; }
    public string? EstatusIpi { get; set; }
    public string CategoriaNombre { get; set; } = string.Empty;
    public string EstadoNombre { get; set; } = string.Empty;
    public string? ProvinciaNombre { get; set; }
    public DateTime FechaGeneracionUtc { get; set; }
    public int TotalHallazgos { get; set; }
    public int HallazgosCriticos { get; set; }
    public int HallazgosAltos { get; set; }
    public int HallazgosMedios { get; set; }
    public int HallazgosBajos { get; set; }
    public bool EsAptoParaSello { get; set; }
    public string ResumenEjecutivo { get; set; } = string.Empty;
    public object Detalles { get; set; } = new object();
    public List<ValidacionResumenDto> Validaciones { get; set; } = new List<ValidacionResumenDto>();
    public List<DocumentoResumenDto> Documentos { get; set; } = new List<DocumentoResumenDto>();
}

public class DocumentoResumenDto
{
    public string NombreArchivo { get; set; } = string.Empty;
    public string TipoDocumento { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public long TamanoBytes { get; set; }
}

public class ValidacionResumenDto
{
    public string TipoValidacion { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public List<HallazgoResumenDto> Hallazgos { get; set; } = new List<HallazgoResumenDto>();
}

public class HallazgoResumenDto
{
    public string Descripcion { get; set; } = string.Empty;
    public string Severidad { get; set; } = string.Empty;
}

public interface IReporteBuilder
{
    Task<ReporteHallazgosDto> BuildReporteAsync(Guid proyectoId, CancellationToken cancellationToken = default);
}
