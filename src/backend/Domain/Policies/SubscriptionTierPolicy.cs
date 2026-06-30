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

    public static bool CanAddTeamMember(Usuario usuario, int teamSizeActual)
    {
        if (usuario.EsAdministrador()) return true;
        
        return usuario.Plan?.MaxUsuariosSecundarios == -1 || teamSizeActual < usuario.Plan?.MaxUsuariosSecundarios;
    }

    public static bool HasModeloLmDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        return usuario.Plan?.ModeloLmDisponible ?? false;
    }

    public static bool HasValidacionLoteDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        return usuario.Plan?.ValidacionLoteDisponible ?? false;
    }

    public static bool HasExportacionPdfDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        return usuario.Plan?.ExportacionPdfDisponible ?? false;
    }

    public static bool HasExportacionExcelDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        return usuario.Plan?.ExportacionExcelDisponible ?? false;
    }

    public static bool HasIntegracionCrmDisponible(Usuario usuario)
    {
        if (usuario.EsAdministrador()) return true;
        return usuario.Plan?.IntegracionCrmDisponible ?? false;
    }

    public static bool CanStoreDocument(Usuario usuario, long currentStorageBytes, long newDocumentBytes)
    {
        if (usuario.EsAdministrador()) return true;
        
        long maxStorageBytes = (usuario.Plan?.MaxAlmacenamientoMb ?? 0) * 1024L * 1024L;
        return usuario.Plan?.MaxAlmacenamientoMb == -1 || (currentStorageBytes + newDocumentBytes) <= maxStorageBytes;
    }
}
