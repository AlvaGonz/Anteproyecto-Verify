namespace UnitTests;

using System;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Xunit;

public class TipoNotificacionTests
{
    [Fact]
    public void Constructor_ShouldSetAllProperties()
    {
        var tipo = new TipoNotificacion(
            "PROYECTO_PUBLICADO",
            "Proyecto verificado y publicado",
            "Proyectos",
            2,
            "InApp,Email",
            "El proyecto ha pasado todas las validaciones",
            "Proyecto {Nombre} publicado",
            "Tu proyecto {Nombre} ha sido verificado y publicado.");

        Assert.Equal("PROYECTO_PUBLICADO", tipo.Codigo);
        Assert.Equal("Proyecto verificado y publicado", tipo.Nombre);
        Assert.Equal("Proyectos", tipo.Categoria);
        Assert.Equal((byte)2, tipo.Prioridad);
        Assert.Equal("InApp,Email", tipo.Canales);
        Assert.Equal("El proyecto ha pasado todas las validaciones", tipo.Descripcion);
        Assert.Equal("Proyecto {Nombre} publicado", tipo.PlantillaTitulo);
        Assert.Equal("Tu proyecto {Nombre} ha sido verificado y publicado.", tipo.PlantillaMensaje);
        Assert.NotEqual(default, tipo.CreatedAtUtc);
    }

    [Fact]
    public void Constructor_WithMinimalArgs_ShouldSetDefaults()
    {
        var tipo = new TipoNotificacion(
            "DOCUMENTO_SUBIDO",
            "Documento cargado",
            "Documentos",
            5,
            "InApp");

        Assert.Equal("DOCUMENTO_SUBIDO", tipo.Codigo);
        Assert.Equal(5, tipo.Prioridad);
        Assert.Null(tipo.Descripcion);
        Assert.Null(tipo.PlantillaTitulo);
        Assert.Null(tipo.PlantillaMensaje);
    }
}
