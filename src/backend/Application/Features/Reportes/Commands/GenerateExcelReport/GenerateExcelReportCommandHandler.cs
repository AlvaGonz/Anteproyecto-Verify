namespace Application.Features.Reportes.Commands.GenerateExcelReport;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Reports;
using Application.Features.Reportes.Commands.GeneratePdfReport;
using Application.Features.Reports.Queries.GenerarReporteHallazgos;
using Domain.Enums;

public class GenerateExcelReportCommandHandler
{
    private readonly IReporteBuilder _reporteBuilder;
    private readonly IReportGenerator _reportGenerator;
    private readonly IAuditLogger _auditLogger;

    public GenerateExcelReportCommandHandler(
        IReporteBuilder reporteBuilder,
        IReportGenerator reportGenerator,
        IAuditLogger auditLogger)
    {
        _reporteBuilder = reporteBuilder;
        _reportGenerator = reportGenerator;
        _auditLogger = auditLogger;
    }

    public async Task<ReportFileDto?> Handle(GenerateExcelReportCommand request, CancellationToken cancellationToken)
    {
        var reporteData = await _reporteBuilder.BuildReporteAsync(request.ProjectId, cancellationToken);
        if (reporteData == null)
        {
            return null;
        }

        var excelBytes = await _reportGenerator.GenerateExcelAsync(reporteData, cancellationToken);

        var fileName = $"VeriFinca_{reporteData.ProyectoId.ToString().Substring(0, 8)}_{DateTime.UtcNow:yyyyMMdd}.xlsx";

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = request.UsuarioId,
            TipoOperacion = TipoOperacion.Reporte,
            Accion = "Generación de Reporte Excel",
            Resultado = "Exitoso",
            ReferenciaExpedienteId = request.ProjectId,
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        }, cancellationToken);

        return new ReportFileDto
        {
            Content = excelBytes,
            FileName = fileName,
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };
    }
}
