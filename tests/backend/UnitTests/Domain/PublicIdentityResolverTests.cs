namespace Tests.Unit.Domain;

using global::Domain.Entities;
using global::Domain.Enums;
using global::Domain.Policies;
using Tests.Shared;
using Xunit;

public class PublicIdentityResolverTests
{
    private static Usuario MakeUser(string? nickname = "nickPro", string? rnc = "101000000", string? razonSocial = "Desarrollos del Este SRL")
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.UpdateProfileExtension("Calle 1", "Santo Domingo", nickname);
        user.UpdateRnc(rnc, razonSocial);
        return user;
    }

    private static Proyecto MakeProject(string? datosDesarrollador = "BORDSHIPP DOMINICANA SRL", string? cedulaRncPropietario = null, string? rncDesarrollador = "131314589")
    {
        var proyecto = new Proyecto("Test", "Loc", System.Guid.NewGuid(), 16, datosDesarrollador, null, null, cedulaRncPropietario);
        proyecto.UpdateRncYMatricula(rncDesarrollador, "M-001");
        return proyecto;
    }

    // ── Sin preferencias: comportamiento heredado ────────────────────────────

    [Fact]
    public void Resolve_SinPreferencias_UsaNombreCompletoYProyecto()
    {
        var user = MakeUser();
        var proyecto = MakeProject(cedulaRncPropietario: "131314589");

        var result = PublicIdentityResolver.Resolve(user, proyecto);

        Assert.Equal("Test User", result.NombreMostrado);
        Assert.Equal("131314589", result.IdentificacionMostrada);
        Assert.Null(result.IdentificacionTipo);
        Assert.Equal("Desarrollos del Este SRL", result.RazonSocialMostrada);
    }

    [Fact]
    public void Resolve_SinPreferencias_FallaAlDatosDesarrolladorDelProyecto()
    {
        var user = MakeUser(razonSocial: null);
        var proyecto = MakeProject(datosDesarrollador: "PROMOTORA NORTE SRL");

        var result = PublicIdentityResolver.Resolve(user, proyecto);

        Assert.Equal("PROMOTORA NORTE SRL", result.RazonSocialMostrada);
    }

    // ── Nombre público ───────────────────────────────────────────────────────

    [Theory]
    [InlineData(NombrePublicoModo.Nickname)]
    [InlineData(NombrePublicoModo.RealName)]
    public void Resolve_NicknameConPreferenciaNickname_UsaNickname(NombrePublicoModo modo)
    {
        var user = MakeUser(nickname: "nickPro");
        user.UpdatePreferenciasPublicas(modo, IdentificacionPublicaModo.Cedula);

        var result = PublicIdentityResolver.Resolve(user, MakeProject());

        Assert.Equal(modo == NombrePublicoModo.Nickname ? "nickPro" : "Test User", result.NombreMostrado);
    }

    [Fact]
    public void Resolve_NicknamePreferidoPeroSinNickname_FallaAlNombreReal()
    {
        var user = MakeUser(nickname: null);
        user.UpdatePreferenciasPublicas(NombrePublicoModo.Nickname, IdentificacionPublicaModo.Cedula);

        var result = PublicIdentityResolver.Resolve(user, MakeProject());

        Assert.Equal("Test User", result.NombreMostrado);
    }

    // ── Identificación pública ───────────────────────────────────────────────

    [Fact]
    public void Resolve_CedulaPreferida_MuestraCedulaDelUsuario()
    {
        var user = MakeUser();
        user.UpdatePreferenciasPublicas(NombrePublicoModo.RealName, IdentificacionPublicaModo.Cedula);

        var result = PublicIdentityResolver.Resolve(user, MakeProject(cedulaRncPropietario: "99999999999"));

        Assert.Equal("001-0000001-1", result.IdentificacionMostrada);
        Assert.Equal(IdentificacionPublicaModo.Cedula, result.IdentificacionTipo);
        Assert.Null(result.RazonSocialMostrada);
    }

    [Fact]
    public void Resolve_RncPreferido_MuestraRncYRazonSocial()
    {
        var user = MakeUser();
        user.UpdatePreferenciasPublicas(NombrePublicoModo.Nickname, IdentificacionPublicaModo.Rnc);

        var result = PublicIdentityResolver.Resolve(user, MakeProject());

        Assert.Equal("101000000", result.IdentificacionMostrada);
        Assert.Equal(IdentificacionPublicaModo.Rnc, result.IdentificacionTipo);
        Assert.Equal("Desarrollos del Este SRL", result.RazonSocialMostrada);
    }

    [Fact]
    public void Resolve_RncPreferidoSinRnc_FallaAlaCedula()
    {
        var user = MakeUser(rnc: null, razonSocial: null);
        user.UpdatePreferenciasPublicas(NombrePublicoModo.RealName, IdentificacionPublicaModo.Rnc);

        var result = PublicIdentityResolver.Resolve(user, MakeProject());

        Assert.Equal("001-0000001-1", result.IdentificacionMostrada);
        Assert.Equal(IdentificacionPublicaModo.Cedula, result.IdentificacionTipo);
        Assert.Null(result.RazonSocialMostrada);
    }

    [Fact]
    public void Resolve_RncPreferidoSinRazonSocial_OcultaRazonSocial()
    {
        var user = MakeUser(razonSocial: null);
        user.UpdatePreferenciasPublicas(NombrePublicoModo.RealName, IdentificacionPublicaModo.Rnc);

        var result = PublicIdentityResolver.Resolve(user, MakeProject());

        Assert.Equal("101000000", result.IdentificacionMostrada);
        Assert.Equal(IdentificacionPublicaModo.Rnc, result.IdentificacionTipo);
        Assert.Null(result.RazonSocialMostrada);
    }

    // ── Combinaciones (ambas opciones seleccionadas) ─────────────────────────

    [Fact]
    public void Resolve_AmbosNombres_MuestraNombreYNickname()
    {
        var user = MakeUser(nickname: "nickPro");
        user.UpdatePreferenciasPublicas(
            NombrePublicoModo.RealName | NombrePublicoModo.Nickname,
            IdentificacionPublicaModo.Cedula);

        var result = PublicIdentityResolver.Resolve(user, MakeProject());

        Assert.Equal("Test User (nickPro)", result.NombreMostrado);
    }

    [Fact]
    public void Resolve_AmbosNombresSinNickname_FallaAlNombreReal()
    {
        var user = MakeUser(nickname: null);
        user.UpdatePreferenciasPublicas(
            NombrePublicoModo.RealName | NombrePublicoModo.Nickname,
            IdentificacionPublicaModo.Cedula);

        var result = PublicIdentityResolver.Resolve(user, MakeProject());

        Assert.Equal("Test User", result.NombreMostrado);
    }

    [Fact]
    public void Resolve_AmbasIdentificaciones_MuestraCedulaYRncConRazonSocial()
    {
        var user = MakeUser();
        user.UpdatePreferenciasPublicas(
            NombrePublicoModo.RealName,
            IdentificacionPublicaModo.Cedula | IdentificacionPublicaModo.Rnc);

        var result = PublicIdentityResolver.Resolve(user, MakeProject());

        Assert.Equal("001-0000001-1 · 101000000", result.IdentificacionMostrada);
        Assert.Equal(IdentificacionPublicaModo.Rnc, result.IdentificacionTipo);
        Assert.Equal("Desarrollos del Este SRL", result.RazonSocialMostrada);
    }

    [Fact]
    public void Resolve_AmbasIdentificacionesSinRnc_FallaSoloAlaCedula()
    {
        var user = MakeUser(rnc: null, razonSocial: null);
        user.UpdatePreferenciasPublicas(
            NombrePublicoModo.RealName,
            IdentificacionPublicaModo.Cedula | IdentificacionPublicaModo.Rnc);

        var result = PublicIdentityResolver.Resolve(user, MakeProject());

        Assert.Equal("001-0000001-1", result.IdentificacionMostrada);
        Assert.Equal(IdentificacionPublicaModo.Cedula, result.IdentificacionTipo);
        Assert.Null(result.RazonSocialMostrada);
    }
}
