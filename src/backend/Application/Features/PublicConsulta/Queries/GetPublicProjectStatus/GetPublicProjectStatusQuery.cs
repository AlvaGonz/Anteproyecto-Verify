namespace Application.Features.PublicConsulta.Queries.GetPublicProjectStatus;

using System;

public class GetPublicProjectStatusQuery
{
    public string? CodigoPublico { get; set; }
    public string? QrToken { get; set; }
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
}
