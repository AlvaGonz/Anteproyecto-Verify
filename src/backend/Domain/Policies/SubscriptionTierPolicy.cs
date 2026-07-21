namespace Domain.Policies;

using Domain.Entities;
using Domain.Enums;

public interface IPlanData
{
    Guid Idsuscripcion { get; }
    string NombrePlan { get; }
    decimal Precio { get; }
    int MaxConsultas { get; }
    int MaxProyectos { get; }
    bool PresentacionPublica { get; }
    bool QrIncluido { get; }
    int MaxUsuariosSecundarios { get; }
    int MaxAlmacenamientoMb { get; }
    bool AlertasTiempoRealDisponible { get; }
    bool ModeloLmDisponible { get; }
    bool ValidacionLoteDisponible { get; }
    bool ExportacionExcelDisponible { get; }
    bool ExportacionPdfDisponible { get; }
    bool IntegracionCrmDisponible { get; }
    string SoporteTipo { get; }
    bool AccesoApi { get; }
}

public interface IEffectivePlanUser
{
    Guid? TitularId { get; }
    IEffectivePlanUser? Titular { get; }
    IPlanData? Plan { get; }
    string? SubscriptionStatus { get; }
    bool CancelAtPeriodEnd { get; }
    string? StripeCustomerId { get; }
    string? StripeSubscriptionId { get; }
    int? MaxUsuariosSecundarios { get; }
}

public static class SubscriptionTierPolicy
{
    public static PlanSuscripcion? GetEffectivePlan(Usuario usuario)
    {
        if (usuario.TitularId != null && usuario.Titular != null)
        {
            var titularPlan = GetEffectivePlan(usuario.Titular);
            if (titularPlan != null && (titularPlan.MaxUsuariosSecundarios == -1 || titularPlan.MaxUsuariosSecundarios > 0))
            {
                return titularPlan;
            }
        }

        if (usuario.Plan == null) return null;
        if (usuario.Plan.Precio == 0m) return usuario.Plan; // Free plan is always active
        if (usuario.SubscriptionStatus == "active" || usuario.SubscriptionStatus == "trialing")
        {
            return usuario.Plan;
        }
        return null; // Treat as no paid plan
    }

    public static PlanSuscripcion? GetEffectivePlan(IEffectivePlanUser user)
    {
        if (user.TitularId != null && user.Titular != null)
        {
            var titularPlan = GetEffectivePlan(user.Titular);
            if (titularPlan != null && (titularPlan.MaxUsuariosSecundarios == -1 || titularPlan.MaxUsuariosSecundarios > 0))
            {
                return titularPlan;
            }
        }

        if (user.Plan == null) 
        {
            return null;
        }
        
        if (user.Plan.Precio == 0m) 
        {
            return CreatePlanFromData(user.Plan);
        }
        
        if (user.SubscriptionStatus == "active" || user.SubscriptionStatus == "trialing")
        {
            return CreatePlanFromData(user.Plan);
        }
        
        return null; // Treat as no paid plan
    }

    private static PlanSuscripcion CreatePlanFromData(IPlanData planData)
    {
        return PlanSuscripcion.Create(
            planData.Idsuscripcion,
            planData.NombrePlan,
            planData.Precio,
            planData.MaxConsultas,
            planData.MaxProyectos,
            planData.PresentacionPublica,
            planData.QrIncluido,
            planData.MaxUsuariosSecundarios,
            planData.MaxAlmacenamientoMb,
            planData.AlertasTiempoRealDisponible,
            planData.ModeloLmDisponible,
            planData.ValidacionLoteDisponible,
            planData.ExportacionExcelDisponible,
            planData.ExportacionPdfDisponible,
            planData.IntegracionCrmDisponible,
            planData.SoporteTipo,
            planData.AccesoApi);
    }

    public static bool CanConsult(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.HasConsultasDisponibles(usuario.ConsultasUsadas) ?? false;
    }

    public static bool CanCreateProject(Usuario usuario, int proyectosActuales)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.HasProyectosDisponibles(proyectosActuales) ?? false;
    }

    public static bool CanViewPublicProject(Usuario usuario, Guid projectOwnerId)
    {
        // Admins can always view
        if (usuario.EsAdministrador()) return true;

        // Project owner can always view their own projects
        if (usuario.Id == projectOwnerId) return true;

        // Check effective plan and consultation quota
        var plan = GetEffectivePlan(usuario);
        if (plan == null) return false;

        return plan.HasConsultasDisponibles(usuario.ConsultasUsadas);
    }

    public static bool IsProjectPublic(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.PresentacionPublica ?? false;
    }

    public static bool CanAccessApi(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.AccesoApi ?? false;
    }

    public static bool HasQrIncluido(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.QrIncluido ?? false;
    }

    public static string GetTierName(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return "Admin";
        
        var plan = GetEffectivePlan(usuario);
        return plan?.NombrePlan ?? "None";
    }

    public static bool CanAddTeamMember(Usuario usuario, int teamSizeActual)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan != null && (plan.MaxUsuariosSecundarios == -1 || teamSizeActual < plan.MaxUsuariosSecundarios);
    }

    public static bool HasModeloLmDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.ModeloLmDisponible ?? false;
    }

    public static bool HasValidacionLoteDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.ValidacionLoteDisponible ?? false;
    }

    public static bool HasExportacionPdfDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.ExportacionPdfDisponible ?? false;
    }

    public static bool HasExportacionExcelDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.ExportacionExcelDisponible ?? false;
    }

    public static bool HasIntegracionCrmDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        return plan?.IntegracionCrmDisponible ?? false;
    }

    public static bool CanStoreDocument(Usuario usuario, long currentStorageBytes, long newDocumentBytes)
    {
        if (usuario.EsAdministrador()) return true;
        
        var plan = GetEffectivePlan(usuario);
        if (plan == null) return false;
        
        long maxStorageBytes = plan.MaxAlmacenamientoMb * 1024L * 1024L;
        return plan.MaxAlmacenamientoMb == -1 || (currentStorageBytes + newDocumentBytes) <= maxStorageBytes;
    }
}
