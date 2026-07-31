namespace Domain.Enums;

public enum TipoOperacion
{
    General = 0,
    ConsultaPublica = 1,
    Validacion = 2,
    Certificacion = 3,
    Reporte = 4,
    Sistema = 5,
    EmailEnviado = 6,
    EmailFallido = 7,
    ReglaModificada = 8,
    CuentaEliminada = 9,
    CuentaRecuperada = 10,
    CuentaPurgada = 11,
    TwoFactorActivado = 12,
    TwoFactorDesactivado = 13,
    TwoFactorVerificado = 14,
    TwoFactorFallido = 15,
    EmailOtpSolicitado = 16,
    EmailOtpUsado = 17,
    CodigoRecuperacionUsado = 18
}
