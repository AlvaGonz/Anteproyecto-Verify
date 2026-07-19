namespace Application.Features.Subscriptions.Queries.GetMySubscriptionStatus;

using System;
using Domain.Policies;

public record GetMySubscriptionStatusQuery(Guid UserId);

public interface IUserSubscriptionReadRepository
{
    Task<UserSubscriptionData?> GetUserWithPlansAsync(Guid userId, CancellationToken ct = default);
}

public record UserSubscriptionData
{
    public Guid Id { get; init; }
    public PlanData? Plan { get; init; }
    public int ConsultasUsadas { get; init; }
    public int ProyectosCreados { get; init; }
    public string? SubscriptionStatus { get; init; }
    public DateTime? CurrentPeriodEnd { get; init; }
    public bool CancelAtPeriodEnd { get; init; }
    public DateTime? CancelAt { get; init; }
    public string? StripeSubscriptionId { get; init; }
    public string? PendingBillingCycle { get; init; }
    public string? StripeCustomerId { get; init; }
    public Guid? TitularId { get; init; }
    public UserSubscriptionData? Titular { get; init; }
    public bool IsManagedByStripe { get; init; }
    public string? NombreCompleto { get; init; }
}

public record PlanData : IPlanData
{
    public Guid Idsuscripcion { get; init; }
    public string NombrePlan { get; init; } = string.Empty;
    public decimal Precio { get; init; }
    public int MaxConsultas { get; init; }
    public int MaxProyectos { get; init; }
    public bool PresentacionPublica { get; init; }
    public bool QrIncluido { get; init; }
    public int MaxUsuariosSecundarios { get; init; }
    public int MaxAlmacenamientoMb { get; init; }
    public bool AlertasTiempoRealDisponible { get; init; }
    public bool ModeloLmDisponible { get; init; }
    public bool ValidacionLoteDisponible { get; init; }
    public bool ExportacionExcelDisponible { get; init; }
    public bool ExportacionPdfDisponible { get; init; }
    public bool IntegracionCrmDisponible { get; init; }
    public string SoporteTipo { get; init; } = string.Empty;
    public bool AccesoApi { get; init; }
}