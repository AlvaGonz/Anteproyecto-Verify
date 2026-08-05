namespace UnitTests;

using System;
using System.Linq;
using Domain.Entities;
using Xunit;

public class NotificacionTaxonomyTests
{
    [Fact]
    public void Constructor_Legacy_ShouldStillWorkForBackwardCompatibility()
    {
        var notif = new Notificacion(
            usuarioId: Guid.NewGuid(),
            mensaje: "Test message",
            tipo: "Success",
            enlaceRelacionado: "/dashboard");

        Assert.Equal("Test message", notif.Mensaje);
        Assert.Equal("Success", notif.Tipo);
        Assert.Null(notif.TipoNotificacionId);
        Assert.Null(notif.TipoNotificacion);
        Assert.Equal((byte)3, notif.Prioridad);
        Assert.Empty(notif.Entregas);
    }

    [Fact]
    public void Constructor_Taxonomy_ShouldSetTypePriorityAndDeliveries()
    {
        var usuarioId = Guid.NewGuid();

        var notif = new Notificacion(
            usuarioId: usuarioId,
            mensaje: "Tu proyecto ha sido publicado",
            tipoNotificacionId: 11,
            tipoCodigo: "PROYECTO_PUBLICADO",
            prioridad: 2,
            canales: new[] { "InApp", "Email" },
            enlaceRelacionado: "/projects/abc",
            entidadReferenciaId: Guid.NewGuid(),
            entidadReferenciaTipo: "Proyecto");

        Assert.Equal("Tu proyecto ha sido publicado", notif.Mensaje);
        Assert.Equal("PROYECTO_PUBLICADO", notif.Tipo);
        Assert.Equal(11, notif.TipoNotificacionId);
        Assert.Equal((byte)2, notif.Prioridad);
        Assert.Equal("/projects/abc", notif.EnlaceRelacionado);
        Assert.NotNull(notif.EntidadReferenciaId);
        Assert.Equal("Proyecto", notif.EntidadReferenciaTipo);
        Assert.Equal(2, notif.Entregas.Count);
        Assert.Contains(notif.Entregas, e => e.Canal == "InApp");
        Assert.Contains(notif.Entregas, e => e.Canal == "Email");
        Assert.All(notif.Entregas, e => Assert.Equal("Pendiente", e.Estado));
    }

    [Fact]
    public void Constructor_Taxonomy_WithoutReferencedEntity_ShouldAllowNull()
    {
        var notif = new Notificacion(
            usuarioId: Guid.NewGuid(),
            mensaje: "Test",
            tipoNotificacionId: 1,
            tipoCodigo: "BIENVENIDA_REGISTRO",
            prioridad: 4,
            canales: new[] { "InApp" });

        Assert.Null(notif.EntidadReferenciaId);
        Assert.Null(notif.EntidadReferenciaTipo);
    }

    [Fact]
    public void Constructor_Taxonomy_EmptyCanales_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() => new Notificacion(
            Guid.NewGuid(), "Test", 1, "TEST", 3, Array.Empty<string>()));
    }

    [Fact]
    public void Constructor_Taxonomy_NullCanales_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() => new Notificacion(
            Guid.NewGuid(), "Test", 1, "TEST", 3, null!));
    }

    [Fact]
    public void CodigoReferencia_ShouldBeGeneratedInBothConstructors()
    {
        var legacy = new Notificacion(Guid.NewGuid(), "Test", "Info");
        var taxonomy = new Notificacion(Guid.NewGuid(), "Test", 1, "TEST", 3, new[] { "InApp" });

        Assert.False(string.IsNullOrWhiteSpace(legacy.CodigoReferencia));
        Assert.False(string.IsNullOrWhiteSpace(taxonomy.CodigoReferencia));
        Assert.Contains("-", legacy.CodigoReferencia);
    }
}
