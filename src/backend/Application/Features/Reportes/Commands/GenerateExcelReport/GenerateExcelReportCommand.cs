namespace Application.Features.Reportes.Commands.GenerateExcelReport;

using System;
using Application.Features.Reportes.Commands.GeneratePdfReport;

public class GenerateExcelReportCommand
{
    public Guid ProjectId { get; set; }
    public Guid? UsuarioId { get; set; }
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
}
