namespace Domain.Policies;

using Domain.Entities;
using Domain.Enums;

/// <summary>
/// Resultado resuelto de cómo se presenta públicamente al responsable de un
/// proyecto. Single source of truth: la UI consume este contrato y no recompone
/// reglas de presentación ni decide qué identificador sensible mostrar.
/// </summary>
public record PublicPresentation(
    string NombreMostrado,
    string? IdentificacionMostrada,
    IdentificacionPublicaModo? IdentificacionTipo,
    string? RazonSocialMostrada);

/// <summary>
/// Política centralizada de presentación pública del responsable registral.
/// Aplica las preferencias del usuario con fallbacks válidos y conserva el
/// comportamiento heredado (datos registrales del proyecto) cuando el usuario
/// no ha configurado preferencias explícitas.
/// </summary>
public static class PublicIdentityResolver
{
    public static PublicPresentation Resolve(Usuario usuario, Proyecto proyecto)
    {
        var identificacion = ResolveIdentificacion(usuario, proyecto);
        return new PublicPresentation(
            ResolveNombreMostrado(usuario),
            identificacion.Mostrada,
            identificacion.Tipo,
            ResolveRazonSocialMostrada(usuario, proyecto));
    }

    private static string ResolveNombreMostrado(Usuario usuario)
    {
        if (usuario.NombrePublicoModo == NombrePublicoModo.Nickname && !string.IsNullOrWhiteSpace(usuario.Nickname))
        {
            return usuario.Nickname!;
        }

        return usuario.NombreCompleto;
    }

    private static (string? Mostrada, IdentificacionPublicaModo? Tipo) ResolveIdentificacion(Usuario usuario, Proyecto proyecto)
    {
        if (usuario.IdentificacionPublicaModo == IdentificacionPublicaModo.Rnc)
        {
            if (!string.IsNullOrWhiteSpace(usuario.Rnc))
            {
                return (usuario.Rnc, IdentificacionPublicaModo.Rnc);
            }

            // Fallback: sin RNC registrado se muestra la cédula
            return (usuario.Cedula, IdentificacionPublicaModo.Cedula);
        }

        if (usuario.IdentificacionPublicaModo == IdentificacionPublicaModo.Cedula)
        {
            if (!string.IsNullOrWhiteSpace(usuario.Cedula))
            {
                return (usuario.Cedula, IdentificacionPublicaModo.Cedula);
            }

            return (usuario.Rnc, string.IsNullOrWhiteSpace(usuario.Rnc) ? null : IdentificacionPublicaModo.Rnc);
        }

        // Sin preferencia explícita: comportamiento heredado (datos registrales del proyecto)
        return (proyecto.CedulaRncPropietario ?? proyecto.RncDesarrollador, null);
    }

    private static string? ResolveRazonSocialMostrada(Usuario usuario, Proyecto proyecto)
    {
        return usuario.IdentificacionPublicaModo switch
        {
            IdentificacionPublicaModo.Rnc => string.IsNullOrWhiteSpace(usuario.RazonSocial) ? null : usuario.RazonSocial,
            IdentificacionPublicaModo.Cedula => null,
            _ => string.IsNullOrWhiteSpace(usuario.RazonSocial) ? proyecto.DatosDesarrollador : usuario.RazonSocial
        };
    }
}
