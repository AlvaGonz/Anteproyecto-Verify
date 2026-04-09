namespace Application.Abstractions.Reports;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Reports.Queries.GenerarReporteHallazgos;

public interface IReportGenerator
{
    Task<byte[]> GeneratePdfAsync(ReporteHallazgosDto reporte, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateExcelAsync(ReporteHallazgosDto reporte, CancellationToken cancellationToken = default);
}
