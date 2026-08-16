namespace Domain.Policies;

using System.Collections.Generic;
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
        var modo = usuario.NombrePublicoModo ?? NombrePublicoModo.RealName; // legado: nombre real
        var mostrarReal = modo.HasFlag(NombrePublicoModo.RealName);
        var mostrarNickname = modo.HasFlag(NombrePublicoModo.Nickname) && !string.IsNullOrWhiteSpace(usuario.Nickname);

        if (mostrarReal && mostrarNickname)
        {
            return $"{usuario.NombreCompleto} ({usuario.Nickname})";
        }

        if (mostrarNickname)
        {
            return usuario.Nickname!;
        }

        return usuario.NombreCompleto;
    }

    private static (string? Mostrada, IdentificacionPublicaModo? Tipo) ResolveIdentificacion(Usuario usuario, Proyecto proyecto)
    {
        var modo = usuario.IdentificacionPublicaModo;
        if (modo is null)
        {
            // Sin preferencia explícita: comportamiento heredado (datos registrales del proyecto)
            return (proyecto.CedulaRncPropietario ?? proyecto.RncDesarrollador, null);
        }

        var tieneCedula = !string.IsNullOrWhiteSpace(usuario.Cedula);
        var tieneRnc = !string.IsNullOrWhiteSpace(usuario.Rnc);

        var mostrarCedula = modo.Value.HasFlag(IdentificacionPublicaModo.Cedula) && tieneCedula;
        var mostrarRnc = modo.Value.HasFlag(IdentificacionPublicaModo.Rnc) && tieneRnc;

        // Fallbacks: el documento preferido pero ausente cae al otro
        if (modo.Value.HasFlag(IdentificacionPublicaModo.Rnc) && !mostrarRnc && !mostrarCedula)
        {
            mostrarCedula = tieneCedula;
        }
        if (modo.Value.HasFlag(IdentificacionPublicaModo.Cedula) && !mostrarCedula && !mostrarRnc)
        {
            mostrarRnc = tieneRnc;
        }

        var partes = new List<string>();
        if (mostrarCedula) partes.Add(usuario.Cedula!);
        if (mostrarRnc) partes.Add(usuario.Rnc!);

        IdentificacionPublicaModo? tipo = mostrarRnc
            ? IdentificacionPublicaModo.Rnc
            : mostrarCedula
                ? IdentificacionPublicaModo.Cedula
                : null;
        return (partes.Count > 0 ? string.Join(" · ", partes) : null, tipo);
    }

    private static string? ResolveRazonSocialMostrada(Usuario usuario, Proyecto proyecto)
    {
        var modo = usuario.IdentificacionPublicaModo;
        if (modo is null)
        {
            // Sin preferencia: comportamiento heredado
            return string.IsNullOrWhiteSpace(usuario.RazonSocial) ? proyecto.DatosDesarrollador : usuario.RazonSocial;
        }

        var mostrarRnc = modo.Value.HasFlag(IdentificacionPublicaModo.Rnc) && !string.IsNullOrWhiteSpace(usuario.Rnc);
        if (!mostrarRnc)
        {
            return null;
        }

        return string.IsNullOrWhiteSpace(usuario.RazonSocial) ? null : usuario.RazonSocial;
    }
}
