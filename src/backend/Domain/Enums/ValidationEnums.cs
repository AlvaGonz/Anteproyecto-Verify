namespace Domain.Enums;

public enum DgiiStatus
{
    Activo,
    Inactivo,
    Suspendido,
    SinRegistro,
    ConDeudasTributarias
}

public enum AyuntamientoValidationResult
{
    Verificado,
    NoDisponibleInstitucionalmente,
    ConObservaciones,
    PendienteVerificacionManual
}

public enum DuplicityRiskLevel
{
    Ninguno,
    Bajo,
    Medio,
    Alto,
    Critico
}

public enum DocumentFormalStatus
{
    Vigente,
    Vencido,
    ConObservacionesFormales,
    Incompleto
}

public enum AlertType
{
    Informativa,
    Advertencia,
    Critica
}

public enum AlertCategory
{
    DgiiRiesgoOperativo,
    DuplicidadRegistral,
    InconsistenciaDocumental,
    VigenciaDocumental,
    ValidacionMunicipal
}
