namespace Domain.Enums;

/// <summary>
/// Canonical CodigoUnico values for <see cref="ProyectoEstado"/> rows.
/// Must match migration seed data and the frontend ProjectStatus string enum.
/// </summary>
public static class ProjectStatusCodes
{
    public const string Creado = "CREADO";
    public const string Editado = "EDITADO";
    public const string Revision = "REVISION";
    public const string Observacion = "OBSERVACION";
    public const string Publicado = "PUBLICADO";

    public static string ToCodigoUnico(this ProjectStatus status) => status switch
    {
        ProjectStatus.Creado => Creado,
        ProjectStatus.Editado => Editado,
        ProjectStatus.Revision => Revision,
        ProjectStatus.ConObservacion => Observacion,
        ProjectStatus.Publicado => Publicado,
        _ => throw new ArgumentOutOfRangeException(nameof(status), status, "Estado de proyecto desconocido.")
    };

    public static bool TryParseCodigoUnico(string? codigo, out ProjectStatus status)
    {
        switch ((codigo ?? string.Empty).Trim().ToUpperInvariant())
        {
            case Creado:
                status = ProjectStatus.Creado;
                return true;
            case Editado:
                status = ProjectStatus.Editado;
                return true;
            case Revision:
                status = ProjectStatus.Revision;
                return true;
            case Observacion:
            case "CONOBSERVACION":
            case "CON_OBSERVACION":
                status = ProjectStatus.ConObservacion;
                return true;
            case Publicado:
                status = ProjectStatus.Publicado;
                return true;
            default:
                // Also accept PascalCase enum names for backward compatibility
                if (Enum.TryParse(codigo, ignoreCase: true, out status)
                    && Enum.IsDefined(status))
                {
                    return true;
                }
                status = default;
                return false;
        }
    }
}
