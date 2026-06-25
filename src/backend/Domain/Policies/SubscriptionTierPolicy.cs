namespace Domain.Policies;

using Domain.Entities;
using Domain.Enums;

public static class SubscriptionTierPolicy
{
    public static bool CanConsult(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        return usuario.Plan?.HasConsultasDisponibles(usuario.ConsultasUsadas) ?? false;
    }

    public static bool CanCreateProject(Usuario usuario, int proyectosActuales)
    {
        if (usuario.EsAdministrador()) return true;
        
        return usuario.Plan?.HasProyectosDisponibles(proyectosActuales) ?? false;
    }

    public static bool IsProjectPublic(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        return usuario.Plan?.PresentacionPublica ?? false;
    }

    public static bool CanAccessApi(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        return usuario.Plan?.AccesoApi ?? false;
    }

    public static bool HasQrIncluido(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        
        return usuario.Plan?.QrIncluido ?? false;
    }

    public static string GetTierName(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return "Admin";
        
        return usuario.Plan?.NombrePlan ?? "None";
    }
}
