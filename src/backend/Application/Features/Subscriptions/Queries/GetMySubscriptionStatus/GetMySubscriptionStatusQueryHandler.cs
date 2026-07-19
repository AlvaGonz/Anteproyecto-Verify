namespace Application.Features.Subscriptions.Queries.GetMySubscriptionStatus;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Subscriptions;
using Domain.Policies;

public class GetMySubscriptionStatusQueryHandler
{
    private readonly IUserSubscriptionReadRepository _repository;

    public GetMySubscriptionStatusQueryHandler(IUserSubscriptionReadRepository repository)
    {
        _repository = repository;
    }

    public async Task<MySubscriptionStatusDto> HandleAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _repository.GetUserWithPlansAsync(userId, cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        var hasPlan = user.Plan != null;
        var effectiveStatus = user.SubscriptionStatus ?? (hasPlan ? "active" : null);

        var isFree = hasPlan && user.Plan!.Precio == 0m;
        if (isFree && effectiveStatus == "active")
        {
            effectiveStatus = "free";
        }

        if (!string.IsNullOrEmpty(user.StripeCustomerId) &&
            string.IsNullOrEmpty(user.StripeSubscriptionId) &&
            hasPlan && !isFree)
        {
            effectiveStatus = "incomplete";
        }

        if (effectiveStatus == "active" && user.CancelAtPeriodEnd)
        {
            effectiveStatus = "canceling";
        }

        string? billingCycle = user.PendingBillingCycle;
        if (string.IsNullOrEmpty(billingCycle) && !string.IsNullOrEmpty(user.StripeSubscriptionId))
        {
            billingCycle = user.PendingBillingCycle ?? "monthly";
        }

        var effectivePlan = SubscriptionTierPolicy.GetEffectivePlan(new EffectivePlanUserAdapter(user));

        return new MySubscriptionStatusDto
        {
            Plan = user.Plan?.NombrePlan,
            PlanPrice = user.Plan?.Precio,
            SubscriptionStatus = effectiveStatus,
            CurrentPeriodEnd = user.CurrentPeriodEnd,
            CancelAtPeriodEnd = user.CancelAtPeriodEnd,
            CancelAt = user.CancelAt,
            StripeSubscriptionId = user.StripeSubscriptionId,
            IsManagedByStripe = !string.IsNullOrEmpty(user.StripeSubscriptionId),
            BillingCycle = !string.IsNullOrEmpty(user.PendingBillingCycle) ? user.PendingBillingCycle : billingCycle,
            IsGuest = user.TitularId != null,
            InviterPlan = user.Titular?.Plan?.NombrePlan,
            InviterName = user.Titular?.NombreCompleto,
            PlanLimits = effectivePlan != null ? new PlanLimitsDto
            {
                MaxConsultas = effectivePlan.MaxConsultas,
                MaxProyectos = effectivePlan.MaxProyectos,
                PresentacionPublica = effectivePlan.PresentacionPublica,
                QrIncluido = effectivePlan.QrIncluido,
                MaxUsuariosSecundarios = effectivePlan.MaxUsuariosSecundarios,
                MaxAlmacenamientoMb = effectivePlan.MaxAlmacenamientoMb,
                AlertasTiempoReal = effectivePlan.AlertasTiempoRealDisponible,
                ModeloLm = effectivePlan.ModeloLmDisponible,
                ValidacionLote = effectivePlan.ValidacionLoteDisponible,
                ExportacionExcel = effectivePlan.ExportacionExcelDisponible,
                ExportacionPdf = effectivePlan.ExportacionPdfDisponible,
                IntegracionCrm = effectivePlan.IntegracionCrmDisponible,
                SoporteTipo = effectivePlan.SoporteTipo,
                AccesoApi = effectivePlan.AccesoApi,
                ConsultasUsadas = user.ConsultasUsadas,
                ProyectosCreados = user.ProyectosCreados
            } : null
        };
    }

    private sealed class EffectivePlanUserAdapter : Domain.Policies.IEffectivePlanUser
    {
        private readonly UserSubscriptionData _user;

        public EffectivePlanUserAdapter(UserSubscriptionData user)
        {
            _user = user;
        }

        public Guid? TitularId => _user.TitularId;
        public Domain.Policies.IEffectivePlanUser? Titular => _user.Titular != null ? new EffectivePlanUserAdapter(_user.Titular) : null;
        public Domain.Policies.IPlanData? Plan => _user.Plan;
        public string? SubscriptionStatus => _user.SubscriptionStatus;
        public bool CancelAtPeriodEnd => _user.CancelAtPeriodEnd;
        public string? StripeCustomerId => null;
        public string? StripeSubscriptionId => _user.StripeSubscriptionId;
        public int? MaxUsuariosSecundarios => _user.Plan?.MaxUsuariosSecundarios;
    }
}