namespace Application.Abstractions.Reports;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

public class ReporteHallazgosDto
{
    public Guid ProyectoId { get; set; }
    public string NombreProyecto { get; set; } = string.Empty;
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
