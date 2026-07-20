namespace Application.Features.Subscriptions.Queries.GetMySubscriptionStatus;

using System.Threading;
using System.Threading.Tasks;
using Application.DTOs.Subscriptions;
using Domain.Policies;
using MediatR;
using Microsoft.Extensions.Configuration;
using Stripe;

public class GetMySubscriptionStatusQueryHandler : IRequestHandler<GetMySubscriptionStatusQuery, MySubscriptionStatusDto>
{
    private readonly IUserSubscriptionReadRepository _repository;
    private readonly IConfiguration _configuration;

    public GetMySubscriptionStatusQueryHandler(IUserSubscriptionReadRepository repository, IConfiguration configuration)
    {
        _repository = repository;
        _configuration = configuration;
    }

    public async Task<MySubscriptionStatusDto> Handle(GetMySubscriptionStatusQuery request, CancellationToken cancellationToken = default)
    {
        var user = await _repository.GetUserWithPlansAsync(request.UserId, cancellationToken);

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
            try
            {
                var stripeApiKey = _configuration["Stripe:SecretKey"];
                if (!string.IsNullOrEmpty(stripeApiKey))
                {
                    StripeConfiguration.ApiKey = stripeApiKey;
                    var subService = new SubscriptionService();
                    var sub = await subService.GetAsync(user.StripeSubscriptionId, cancellationToken: cancellationToken);
                    if (sub?.Items?.Data?.Count > 0)
                    {
                        billingCycle = sub.Items.Data[0].Price.Recurring?.Interval;
                    }
                }
            }
            catch (Exception)
            {
                // Log warning but don't fail - fallback to monthly
            }
        }
        if (string.IsNullOrEmpty(billingCycle))
        {
            billingCycle = "monthly";
        }

        PricingInfoDto? pricingInfo = null;
        if (hasPlan && user.Plan!.Precio > 0)
        {
            var annualDiscountPercent = _configuration.GetValue<int>("Pricing:AnnualDiscountPercent", 20);
            var monthlyPrice = user.Plan.Precio;
            var yearlyPrice = Math.Round(monthlyPrice * 12 * (100 - annualDiscountPercent) / 100m, 2);

            pricingInfo = new PricingInfoDto
            {
                MonthlyPrice = monthlyPrice,
                YearlyPrice = yearlyPrice,
                YearlyDiscountPercent = annualDiscountPercent,
                YearlyBadge = $"Ahorra {annualDiscountPercent}%"
            };
        }

        var effectivePlan = SubscriptionTierPolicy.GetEffectivePlan(new EffectivePlanUserAdapter(user, effectiveStatus));

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
            BillingCycle = billingCycle,
            Pricing = pricingInfo,
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
        private readonly string? _effectiveStatus;

        public EffectivePlanUserAdapter(UserSubscriptionData user, string? effectiveStatus = null)
        {
            _user = user;
            _effectiveStatus = effectiveStatus;
        }

        public Guid? TitularId => _user.TitularId;
        public Domain.Policies.IEffectivePlanUser? Titular => _user.Titular != null ? new EffectivePlanUserAdapter(_user.Titular) : null;
        public Domain.Policies.IPlanData? Plan => _user.Plan;
        public string? SubscriptionStatus => _effectiveStatus ?? _user.SubscriptionStatus;
        public bool CancelAtPeriodEnd => _user.CancelAtPeriodEnd;
        public string? StripeCustomerId => null;
        public string? StripeSubscriptionId => _user.StripeSubscriptionId;
        public int? MaxUsuariosSecundarios => _user.Plan?.MaxUsuariosSecundarios;
    }
}