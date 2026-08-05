namespace UnitTests;

using System;
using Domain.Entities;
using Xunit;

public class NotificacionEntregaTests
{
    [Fact]
    public void Constructor_ShouldInitializeAsPendiente()
    {
        var notificacionId = Guid.NewGuid();

        var entrega = new NotificacionEntrega(notificacionId, "InApp");

        Assert.Equal(notificacionId, entrega.NotificacionId);
        Assert.Equal("InApp", entrega.Canal);
        Assert.Equal("Pendiente", entrega.Estado);
        Assert.Equal(0, entrega.Reintentos);
        Assert.Null(entrega.FechaEnvio);
        Assert.Null(entrega.FechaLectura);
        Assert.Null(entrega.ErrorMensaje);
    }

    [Fact]
    public void MarcarEnviado_ShouldSetEstadoYFecha()
    {
        var entrega = new NotificacionEntrega(Guid.NewGuid(), "Email");
        entrega.MarcarEnviado();

        Assert.Equal("Enviado", entrega.Estado);
        Assert.NotNull(entrega.FechaEnvio);
    }

    [Fact]
    public void MarcarFallido_ShouldSetEstadoErrorYReintentar()
    {
        var entrega = new NotificacionEntrega(Guid.NewGuid(), "Push");
        entrega.MarcarFallido("Connection timeout");

        Assert.Equal("Fallido", entrega.Estado);
        Assert.Equal("Connection timeout", entrega.ErrorMensaje);
        Assert.Equal(1, entrega.Reintentos);
    }

    [Fact]
    public void MarcarLeido_ShouldSetFechaLectura()
    {
        var entrega = new NotificacionEntrega(Guid.NewGuid(), "InApp");
        entrega.MarcarEnviado();
        entrega.MarcarLeido();

        Assert.Equal("Leido", entrega.Estado);
        Assert.NotNull(entrega.FechaLectura);
    }

    [Fact]
    public void MarcarLeido_CalledTwice_ShouldNotOverwriteFechaLectura()
    {
        var entrega = new NotificacionEntrega(Guid.NewGuid(), "InApp");
        entrega.MarcarLeido();
        var primeraLectura = entrega.FechaLectura;

        System.Threading.Thread.Sleep(10);
        entrega.MarcarLeido();

        Assert.Equal(primeraLectura, entrega.FechaLectura);
    }
}
