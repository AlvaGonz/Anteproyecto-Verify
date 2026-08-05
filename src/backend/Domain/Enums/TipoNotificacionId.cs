// ponytail: constants synced to TiposNotificaciones seed order (1-18). Adjust if seed order changes.
namespace Domain.Enums;

public static class TipoNotificacionId
{
    public const int BienvenidaRegistro    = 1;
    public const int CuentaCreada          = 2;
    public const int EmailVerificado       = 3;
    public const int CambioContrasena      = 4;
    public const int SuscripcionActivada   = 5;
    public const int SuscripcionCancelada  = 6;
    public const int PagoFallido           = 7;
    public const int ProyectoCreado        = 8;
    public const int ProyectoEditado       = 9;
    public const int ProyectoEnRevision    = 10;
    public const int ProyectoPublicado     = 11;
    public const int ProyectoObservacion   = 12;
    public const int DocumentoSubido       = 13;
    public const int DocumentoValidado     = 14;
    public const int DocumentoRechazado    = 15;
    public const int InteresRegistrado     = 16;
    public const int InvitacionRecibida    = 17;
    public const int LimitesDelegacion     = 18;
}
