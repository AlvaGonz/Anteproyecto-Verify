namespace Application.Features.Reportes.Commands.GeneratePdfReport;

using System;

public class GeneratePdfReportCommand
{
    public Guid ProjectId { get; set; }
    public Guid? UsuarioId { get; set; }
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
}

public class ReportFileDto
{
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}
