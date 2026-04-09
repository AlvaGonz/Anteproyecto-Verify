namespace Infrastructure.Services.Reports;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Reports;
using Domain.Enums;

public class ReporteBuilderService : IReporteBuilder
{
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IHallazgoRepository _hallazgoRepository;

    public ReporteBuilderService(
        IProyectoRepository proyectoRepository,
        IHallazgoRepository hallazgoRepository)
    {
        _proyectoRepository = proyectoRepository;
        _hallazgoRepository = hallazgoRepository;
    }

    public async Task<ReporteHallazgosDto> ConstruirReporteAsync(Guid proyectoId, CancellationToken cancellationToken = default)
    {
        var project = await _proyectoRepository.GetByIdAsync(proyectoId, cancellationToken);
        if (project == null)
            throw new KeyNotFoundException($"Proyecto con ID {proyectoId} no encontrado.");

        var hallazgos = await _hallazgoRepository.GetByProjectIdAsync(proyectoId, cancellationToken);

        int criticos = hallazgos.Count(h => h.Severity == FindingSeverity.Critical);
        int altos = hallazgos.Count(h => h.Severity == FindingSeverity.High);
        int medios = hallazgos.Count(h => h.Severity == FindingSeverity.Medium);
        int bajos = hallazgos.Count(h => h.Severity == FindingSeverity.Low);

        bool esApto = criticos == 0 && altos == 0;

        string resumen = esApto 
            ? "El proyecto cumple con los requisitos principales y es apto para continuar el proceso." 
            : "El proyecto presenta hallazgos de severidad alta o crítica que deben ser subsanados.";

        var detalles = hallazgos.Select(h => new
        {
            h.Id,
            h.Tipo,
            h.Descripcion,
            Severidad = h.Severity.ToString(),
            h.Recomendacion,
            h.FuenteValidacion,
            h.FechaDeteccionUtc
        }).ToList();

        return new ReporteHallazgosDto
        {
            ProyectoId = project.Id,
            NombreProyecto = project.Nombre,
            FechaGeneracionUtc = DateTime.UtcNow,
            TotalHallazgos = hallazgos.Count(),
            HallazgosCriticos = criticos,
            HallazgosAltos = altos,
            HallazgosMedios = medios,
            HallazgosBajos = bajos,
            EsAptoParaSello = esApto,
            ResumenEjecutivo = resumen,
            Detalles = detalles
        };
    }
}
