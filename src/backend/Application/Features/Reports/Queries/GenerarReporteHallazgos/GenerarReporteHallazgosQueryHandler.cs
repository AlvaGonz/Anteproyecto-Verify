namespace Application.Features.Reports.Queries.GenerarReporteHallazgos;

using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Reports;

public class GenerarReporteHallazgosQueryHandler
{
    private readonly IReporteBuilder _reporteBuilder;

    public GenerarReporteHallazgosQueryHandler(IReporteBuilder reporteBuilder)
    {
        _reporteBuilder = reporteBuilder;
    }

    public async Task<ReporteHallazgosDto> Handle(GenerarReporteHallazgosQuery request, CancellationToken cancellationToken)
    {
        return await _reporteBuilder.ConstruirReporteAsync(request.ProyectoId, cancellationToken);
    }
}
