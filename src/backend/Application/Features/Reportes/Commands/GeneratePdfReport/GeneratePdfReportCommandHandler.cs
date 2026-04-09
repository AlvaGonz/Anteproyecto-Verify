namespace Application.Features.Reportes.Commands.GeneratePdfReport;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Abstractions.Reports;
using Application.Features.Reports.Queries.GenerarReporteHallazgos;
using Domain.Enums;

public class GeneratePdfReportCommandHandler
{
    private readonly IReporteBuilder _reporteBuilder;
    private readonly IReportGenerator _reportGenerator;
    private readonly IAuditLogger _auditLogger;

    public GeneratePdfReportCommandHandler(
        IReporteBuilder reporteBuilder,
        IReportGenerator reportGenerator,
        IAuditLogger auditLogger)
    {
        _reporteBuilder = reporteBuilder;
        _reportGenerator = reportGenerator;
        _auditLogger = auditLogger;
    }

    public async Task<ReportFileDto?> Handle(GeneratePdfReportCommand request, CancellationToken cancellationToken)
    {
        var reporteData = await _reporteBuilder.BuildReporteAsync(request.ProjectId, cancellationToken);
        if (reporteData == null)
        {
            return null;
        }

        var pdfBytes = await _reportGenerator.GeneratePdfAsync(reporteData, cancellationToken);

        var fileName = $"VeriFinca_{reporteData.ProyectoId.ToString().Substring(0, 8)}_{DateTime.UtcNow:yyyyMMdd}.pdf";

        await _auditLogger.AppendAsync(new AuditEntryDto
        {
            UsuarioId = request.UsuarioId,
            TipoOperacion = TipoOperacion.Reporte,
            Accion = "Generación de Reporte PDF",
            Resultado = "Exitoso",
            ReferenciaExpedienteId = request.ProjectId,
            IpOrigen = request.IpOrigen,
            UserAgent = request.UserAgent
        }, cancellationToken);

        return new ReportFileDto
        {
            Content = pdfBytes,
            FileName = fileName,
            ContentType = "application/pdf"
        };
    }
}
