namespace Domain.Policies;

using Domain.Entities;
using Domain.Enums;

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
