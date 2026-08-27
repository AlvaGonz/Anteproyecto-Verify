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

    public Task<byte[]> GenerateAuditLogPdfAsync(string userNombreCompleto, IEnumerable<Application.DTOs.Audit.AuditDto> logs, CancellationToken cancellationToken = default)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Helvetica"));

                // Header with Centered Logo
                page.Header().Element(compose => 
                {
                    compose.Column(column =>
                    {
                        column.Item().AlignCenter().Text("V E R I F I N C A")
                            .FontSize(24).Bold().FontColor("#1A365D"); // Deep Navy Blue
                        
                        column.Item().AlignCenter().PaddingTop(2).Text("SISTEMA DE VERIFICACIÓN Y AUTENTICACIÓN INTEGRAL DE PROYECTOS")
                            .FontSize(7).SemiBold().FontColor(Colors.Grey.Darken2);
                        
                        column.Item().PaddingTop(8).LineHorizontal(1.5f).LineColor("#1A365D");
                        
                        column.Item().PaddingTop(10).Row(row =>
                        {
                            row.RelativeItem().Column(infoCol =>
                            {
                                infoCol.Item().Text(t => 
                                {
                                    t.Span("Estos logs pertenecen al usuario: ").Bold();
                                    t.Span(userNombreCompleto);
                                });
                                infoCol.Item().Text(t => 
                                {
                                    t.Span("Exportado en la fecha: ").Bold();
                                    t.Span($"{DateTime.UtcNow:dd/MM/yyyy HH:mm:ss} UTC");
                                });
                            });
                        });
                        
                        column.Item().PaddingTop(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
                    });
                });

                // Content: Table of Audit Logs
                page.Content().PaddingTop(15).Element(compose =>
                {
                    compose.Column(column =>
                    {
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(90);  // Timestamp
                                columns.RelativeColumn(1.2f); // Usuario
                                columns.ConstantColumn(80);  // Evento (Badge)
                                columns.ConstantColumn(80);  // Código
                                columns.RelativeColumn(2f);   // Detalle
                            });

                            table.Header(header =>
                            {
                                static IContainer HeaderCellStyle(IContainer c) => c.Background("#1A365D").PaddingVertical(6).PaddingHorizontal(5).AlignLeft();
                                
                                header.Cell().Element(HeaderCellStyle).Text("Timestamp (UTC)").Bold().FontColor(Colors.White).FontSize(8);
                                header.Cell().Element(HeaderCellStyle).Text("Usuario").Bold().FontColor(Colors.White).FontSize(8);
                                header.Cell().Element(HeaderCellStyle).Text("Evento").Bold().FontColor(Colors.White).FontSize(8);
                                header.Cell().Element(HeaderCellStyle).Text("Código").Bold().FontColor(Colors.White).FontSize(8);
                                header.Cell().Element(HeaderCellStyle).Text("Detalle").Bold().FontColor(Colors.White).FontSize(8);
                            });

                            int index = 0;
                            foreach (var log in logs)
                            {
                                var background = index % 2 == 0 ? "#FFFFFF" : "#F7FAFC"; // Alternating row color
                                index++;

                                static IContainer CellStyle(IContainer c, string bg) => c.Background(bg).BorderBottom(0.5f).BorderColor("#E2E8F0").PaddingVertical(5).PaddingHorizontal(5).AlignLeft();

                                table.Cell().Element(c => CellStyle(c, background)).Text(log.FechaEventoUtc.ToString("dd/MM/yyyy HH:mm:ss")).FontSize(7.5f);
                                table.Cell().Element(c => CellStyle(c, background)).Text(log.UsuarioId?.ToString().Substring(0, 8) ?? "SISTEMA").FontSize(7.5f);
                                
                                // Evento Badge
                                table.Cell().Element(c => CellStyle(c, background)).Element(cell =>
                                {
                                    var text = log.Accion ?? "General";
                                    var bgBadge = "#E2E8F0";
                                    var textBadge = "#4A5568";

                                    if (log.TipoEvento == "ProjectCreated")
                                    {
                                        text = "Creación";
                                        bgBadge = "#EBF8FF"; // Light Blue
                                        textBadge = "#2B6CB0"; // Blue
                                    }
                                    else if (log.TipoEvento == "DocumentUploaded")
                                    {
                                        text = "Carga Doc";
                                        bgBadge = "#E6FFFA"; // Light Teal/Emerald
                                        textBadge = "#319795"; // Teal
                                    }
                                    else if (log.TipoEvento == "ValidationExecuted")
                                    {
                                        text = "Validación";
                                        bgBadge = "#FEEBC8"; // Light Orange
                                        textBadge = "#DD6B20"; // Orange
                                    }

                                    cell.Background(bgBadge)
                                        .PaddingVertical(1)
                                        .PaddingHorizontal(4)
                                        .Border(0.5f)
                                        .BorderColor(bgBadge)
                                        .Text(text)
                                        .Bold()
                                        .FontSize(6.5f)
                                        .FontColor(textBadge);
                                });

                                // Código
                                table.Cell().Element(c => CellStyle(c, background)).Text(log.Codigo ?? "N/A").FontSize(7.5f).FontFamily("Courier New").Bold();
                                
                                // Detalle
                                table.Cell().Element(c => CellStyle(c, background)).Text(log.Detalle ?? "").FontSize(7.5f);
                            }
                        });
                    });
                });

                // Footer
                page.Footer().Element(ComposeFooter);
            });
        });

        return Task.FromResult(document.GeneratePdf());
    }
}
