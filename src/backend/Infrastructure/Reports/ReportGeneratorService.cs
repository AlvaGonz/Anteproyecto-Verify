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
                column.Item().Text(reporte.NombreProyecto).FontSize(16).SemiBold();
                column.Item().Text($"Código: {reporte.CodigoInterno}").FontSize(11);
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

            column.Item().Text("Datos del Proyecto").FontSize(16).SemiBold();

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(150);
                    columns.RelativeColumn();
                });

                static IContainer CellStyle(IContainer c) => c.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(4).DefaultTextStyle(x => x.FontSize(10));

                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("Ubicación");
                table.Cell().Element(CellStyle).Text(reporte.UbicacionTexto);
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("Categoría");
                table.Cell().Element(CellStyle).Text(reporte.CategoriaNombre);
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("Estado");
                table.Cell().Element(CellStyle).Text(reporte.EstadoNombre);
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("Provincia");
                table.Cell().Element(CellStyle).Text(reporte.ProvinciaNombre ?? "N/A");
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("Desarrollador");
                table.Cell().Element(CellStyle).Text(reporte.DatosDesarrollador ?? "N/A");
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("RNC Desarrollador");
                table.Cell().Element(CellStyle).Text(reporte.RncDesarrollador ?? "N/A");
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("Matrícula");
                table.Cell().Element(CellStyle).Text(reporte.Matricula ?? "N/A");
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("Desig. Catastral");
                table.Cell().Element(CellStyle).Text(reporte.DesignacionCatastral ?? "N/A");
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("Superficie (m²)");
                table.Cell().Element(CellStyle).Text(reporte.SuperficieM2?.ToString("N2") ?? "N/A");
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("Valor Estimado");
                table.Cell().Element(CellStyle).Text(reporte.ValorEstimado?.ToString("C0") ?? "N/A");
                table.Cell().Element(c => c.DefaultTextStyle(x => x.SemiBold())).Text("IPI");
                table.Cell().Element(CellStyle).Text(reporte.EstatusIpi ?? "N/A");
            });

            if (reporte.Documentos.Any())
            {
                column.Item().Text("Documentos Adjuntos").FontSize(16).SemiBold();

                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(1);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Element(h => h.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black)).Text("Archivo");
                        header.Cell().Element(h => h.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black)).Text("Tipo");
                        header.Cell().Element(h => h.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black)).Text("Estado");
                    });

                    foreach (var doc in reporte.Documentos)
                    {
                        table.Cell().Element(c => c.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(3)).Text(doc.NombreArchivo).FontSize(9);
                        table.Cell().Element(c => c.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(3)).Text(doc.TipoDocumento).FontSize(9);
                        table.Cell().Element(c => c.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(3)).Text(doc.Estado).FontSize(9);
                    }
                });
            }

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
        
        // Hoja 1: Resumen del Proyecto
        var wsResumen = workbook.Worksheets.Add("Resumen");
        int row = 1;
        wsResumen.Cell(row++, 1).Value = "Código Interno";
        wsResumen.Cell(row - 1, 2).Value = reporte.CodigoInterno;
        wsResumen.Cell(row++, 1).Value = "Nombre del Proyecto";
        wsResumen.Cell(row - 1, 2).Value = reporte.NombreProyecto;
        wsResumen.Cell(row++, 1).Value = "Ubicación";
        wsResumen.Cell(row - 1, 2).Value = reporte.UbicacionTexto;
        wsResumen.Cell(row++, 1).Value = "Categoría";
        wsResumen.Cell(row - 1, 2).Value = reporte.CategoriaNombre;
        wsResumen.Cell(row++, 1).Value = "Estado";
        wsResumen.Cell(row - 1, 2).Value = reporte.EstadoNombre;
        wsResumen.Cell(row++, 1).Value = "Provincia";
        wsResumen.Cell(row - 1, 2).Value = reporte.ProvinciaNombre ?? "N/A";
        wsResumen.Cell(row++, 1).Value = "Desarrollador";
        wsResumen.Cell(row - 1, 2).Value = reporte.DatosDesarrollador ?? "N/A";
        wsResumen.Cell(row++, 1).Value = "RNC Desarrollador";
        wsResumen.Cell(row - 1, 2).Value = reporte.RncDesarrollador ?? "N/A";
        wsResumen.Cell(row++, 1).Value = "Matrícula";
        wsResumen.Cell(row - 1, 2).Value = reporte.Matricula ?? "N/A";
        wsResumen.Cell(row++, 1).Value = "Desig. Catastral";
        wsResumen.Cell(row - 1, 2).Value = reporte.DesignacionCatastral ?? "N/A";
        wsResumen.Cell(row++, 1).Value = "Superficie (m²)";
        wsResumen.Cell(row - 1, 2).Value = reporte.SuperficieM2;
        wsResumen.Cell(row++, 1).Value = "Valor Estimado";
        wsResumen.Cell(row - 1, 2).Value = reporte.ValorEstimado;
        wsResumen.Cell(row++, 1).Value = "IPI";
        wsResumen.Cell(row - 1, 2).Value = reporte.EstatusIpi ?? "N/A";
        row++;
        wsResumen.Cell(row++, 1).Value = "Fecha Generación";
        wsResumen.Cell(row - 1, 2).Value = reporte.FechaGeneracionUtc.ToString("yyyy-MM-dd HH:mm:ss");
        wsResumen.Cell(row++, 1).Value = "Apto para Sello";
        wsResumen.Cell(row - 1, 2).Value = reporte.EsAptoParaSello ? "Sí" : "No";
        wsResumen.Cell(row++, 1).Value = "Total Hallazgos";
        wsResumen.Cell(row - 1, 2).Value = reporte.TotalHallazgos;
        wsResumen.Cell(row++, 1).Value = "Críticos / Altos / Medios / Bajos";
        wsResumen.Cell(row - 1, 2).Value = $"{reporte.HallazgosCriticos} / {reporte.HallazgosAltos} / {reporte.HallazgosMedios} / {reporte.HallazgosBajos}";
        wsResumen.Columns().AdjustToContents();

        // Hoja 2: Documentos
        if (reporte.Documentos.Any())
        {
            var wsDocs = workbook.Worksheets.Add("Documentos");
            wsDocs.Cell(1, 1).Value = "Archivo";
            wsDocs.Cell(1, 2).Value = "Tipo";
            wsDocs.Cell(1, 3).Value = "Estado";
            wsDocs.Cell(1, 4).Value = "Tamaño (bytes)";
            int rowDoc = 2;
            foreach (var doc in reporte.Documentos)
            {
                wsDocs.Cell(rowDoc, 1).Value = doc.NombreArchivo;
                wsDocs.Cell(rowDoc, 2).Value = doc.TipoDocumento;
                wsDocs.Cell(rowDoc, 3).Value = doc.Estado;
                wsDocs.Cell(rowDoc, 4).Value = doc.TamanoBytes;
                rowDoc++;
            }
            wsDocs.Columns().AdjustToContents();
        }

        // Hoja 3: Validaciones
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

        // Hoja 4: Hallazgos
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
