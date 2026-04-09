namespace Application.Abstractions.Reports;

using System;
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
    public object Detalles { get; set; } = new object(); // Can be a list of detailed findings
}

public interface IReporteBuilder
{
    Task<ReporteHallazgosDto> ConstruirReporteAsync(Guid proyectoId, CancellationToken cancellationToken = default);
}
