namespace Application.DTOs.Subscriptions;

using System;

public class MySubscriptionStatusDto
{
    public string? Plan { get; set; }
    public decimal? PlanPrice { get; set; }
    public string? SubscriptionStatus { get; set; }
    public DateTime? CurrentPeriodEnd { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
    public DateTime? CancelAt { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public bool IsManagedByStripe { get; set; }
    public string? BillingCycle { get; set; }
    public bool IsGuest { get; set; }
    public string? InviterPlan { get; set; }
    public string? InviterName { get; set; }
    public PlanLimitsDto? PlanLimits { get; set; }
    public PricingInfoDto? Pricing { get; set; }
}

public class PricingInfoDto
{
    public decimal MonthlyPrice { get; set; }
    public decimal YearlyPrice { get; set; }
    public int YearlyDiscountPercent { get; set; }
    public string YearlyBadge { get; set; } = string.Empty;
}

public class PlanLimitsDto
{
    public int MaxConsultas { get; set; }
    public int MaxProyectos { get; set; }
    public bool PresentacionPublica { get; set; }
    public bool QrIncluido { get; set; }
    public int MaxUsuariosSecundarios { get; set; }
    public int MaxAlmacenamientoMb { get; set; }
    public bool AlertasTiempoReal { get; set; }
    public bool ModeloLm { get; set; }
    public bool ValidacionLote { get; set; }
    public bool ExportacionExcel { get; set; }
    public bool ExportacionPdf { get; set; }
    public bool IntegracionCrm { get; set; }
    public string SoporteTipo { get; set; } = string.Empty;
    public bool AccesoApi { get; set; }
    public int ConsultasUsadas { get; set; }
    public int ProyectosCreados { get; set; }
}

public class SessionStatusDto
{
    public string? Status { get; set; }
    public string? CustomerEmail { get; set; }
    public string? Plan { get; set; }
}

public class ReconcileResponseDto
{
    public string Message { get; set; } = string.Empty;
    public string? SubscriptionId { get; set; }
    public string? Status { get; set; }
    public DateTime? PeriodEnd { get; set; }
}

public class ReconcileRequest
{
    public string StripeCustomerId { get; set; } = string.Empty;
}

