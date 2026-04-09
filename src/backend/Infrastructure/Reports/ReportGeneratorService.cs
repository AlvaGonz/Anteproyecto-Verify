namespace Infrastructure.Reports;

using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Reports;
using Application.Features.Reports.Queries.GenerarReporteHallazgos;
using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

public class ReportGeneratorService : IReportGenerator
{
    public ReportGeneratorService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public Task<byte[]> GeneratePdfAsync(ReporteHallazgosDto reporte, CancellationToken cancellationToken = default)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Element(compose => ComposeHeader(compose, reporte));
                page.Content().Element(compose => ComposeContent(compose, reporte));
                page.Footer().Element(ComposeFooter);
            });
        });

        return Task.FromResult(document.GeneratePdf());
    }

    private void ComposeHeader(IContainer container, ReporteHallazgosDto reporte)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("Reporte de Validaciones VeriFinca").FontSize(20).SemiBold().FontColor(Colors.Blue.Darken2);
                column.Item().Text($"Proyecto ID: {reporte.ProyectoId}").FontSize(14);
                column.Item().Text($"Fecha de Emisión: {reporte.FechaGeneracionUtc:dd/MM/yyyy HH:mm} UTC").FontSize(10);
                column.Item().Text($"Apto para Sello: {(reporte.EsAptoParaSello ? "Sí" : "No")}").FontSize(12).SemiBold().FontColor(reporte.EsAptoParaSello ? Colors.Green.Medium : Colors.Red.Medium);
            });
        });
    }

    private void ComposeContent(IContainer container, ReporteHallazgosDto reporte)
    {
        container.PaddingVertical(1, Unit.Centimetre).Column(column =>
        {
            column.Spacing(20);

            column.Item().Text("Resumen de Validaciones").FontSize(16).SemiBold();
            
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                });

                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Dimensión");
                    header.Cell().Element(CellStyle).Text("Estado");

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    }
                });

                foreach (var val in reporte.Validaciones)
                {
                    table.Cell().Element(CellStyle).Text(val.TipoValidacion);
                    table.Cell().Element(CellStyle).Text(val.Estado);

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                    }
                }
            });

            column.Item().Text("Hallazgos Detallados").FontSize(16).SemiBold();

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Dimensión");
                    header.Cell().Element(CellStyle).Text("Descripción");
                    header.Cell().Element(CellStyle).Text("Severidad");

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    }
                });

                foreach (var val in reporte.Validaciones)
                {
                    foreach (var hallazgo in val.Hallazgos)
                    {
                        table.Cell().Element(CellStyle).Text(val.TipoValidacion);
                        table.Cell().Element(CellStyle).Text(hallazgo.Descripcion);
                        table.Cell().Element(CellStyle).Text(hallazgo.Severidad).FontColor(GetSeverityColor(hallazgo.Severidad));

                        static IContainer CellStyle(IContainer container)
                        {
                            return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                        }
                    }
                }
            });
        });
    }

    private string GetSeverityColor(string severity)
    {
        return severity switch
        {
            "Critical" => Colors.Red.Darken2,
            "High" => Colors.Orange.Medium,
            "Medium" => Colors.Yellow.Darken2,
            "Low" => Colors.Green.Medium,
            _ => Colors.Black
        };
    }

    private void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Text(x =>
        {
            x.Span("Página ");
            x.CurrentPageNumber();
            x.Span(" de ");
            x.TotalPages();
        });
    }

    public Task<byte[]> GenerateExcelAsync(ReporteHallazgosDto reporte, CancellationToken cancellationToken = default)
    {
        using var workbook = new XLWorkbook();
        
        // Hoja 1: Resumen
        var wsResumen = workbook.Worksheets.Add("Resumen");
        wsResumen.Cell(1, 1).Value = "Proyecto ID";
        wsResumen.Cell(1, 2).Value = reporte.ProyectoId.ToString();
        wsResumen.Cell(2, 1).Value = "Fecha Generación";
        wsResumen.Cell(2, 2).Value = reporte.FechaGeneracionUtc.ToString("yyyy-MM-dd HH:mm:ss");
        wsResumen.Cell(3, 1).Value = "Apto para Sello";
        wsResumen.Cell(3, 2).Value = reporte.EsAptoParaSello ? "Sí" : "No";
        wsResumen.Columns().AdjustToContents();

        // Hoja 2: Validaciones
        var wsValidaciones = workbook.Worksheets.Add("Validaciones");
        wsValidaciones.Cell(1, 1).Value = "Dimensión";
        wsValidaciones.Cell(1, 2).Value = "Estado";
        wsValidaciones.Cell(1, 3).Value = "Total Hallazgos";
        
        int rowVal = 2;
        foreach (var val in reporte.Validaciones)
        {
            wsValidaciones.Cell(rowVal, 1).Value = val.TipoValidacion;
            wsValidaciones.Cell(rowVal, 2).Value = val.Estado;
            wsValidaciones.Cell(rowVal, 3).Value = val.Hallazgos.Count;
            rowVal++;
        }
        wsValidaciones.Columns().AdjustToContents();

        // Hoja 3: Hallazgos
        var wsHallazgos = workbook.Worksheets.Add("Hallazgos");
        wsHallazgos.Cell(1, 1).Value = "Dimensión";
        wsHallazgos.Cell(1, 2).Value = "Descripción";
        wsHallazgos.Cell(1, 3).Value = "Severidad";
        
        int rowHal = 2;
        foreach (var val in reporte.Validaciones)
        {
            foreach (var hallazgo in val.Hallazgos)
            {
                wsHallazgos.Cell(rowHal, 1).Value = val.TipoValidacion;
                wsHallazgos.Cell(rowHal, 2).Value = hallazgo.Descripcion;
                wsHallazgos.Cell(rowHal, 3).Value = hallazgo.Severidad;
                rowHal++;
            }
        }
        wsHallazgos.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return Task.FromResult(stream.ToArray());
    }
}
