namespace UnitTests;

using System;
using Domain.Entities;
using Domain.Enums;
using Xunit;

public class DomainTests
{
    [Fact]
    public void Usuario_Should_Create_With_Valid_Data()
    {
        // Arrange
        var nombre = "Juan";
        var apellido = "Perez";
        var email = "juan@example.com";
        var hash = "hash";
        var rol = UserRole.User;
        var telefono = "123456";
        var cedula = "40200000000";

        // Act
        var usuario = new Usuario(nombre, apellido, email, hash, rol, telefono, cedula);

        // Assert
        Assert.Equal("Juan Perez", usuario.NombreCompleto);
        Assert.Equal(email, usuario.CorreoElectronico);
        Assert.Equal(rol, usuario.Rol);
        Assert.True(usuario.Activo);
        Assert.NotEqual(Guid.Empty, usuario.Id);
    }

    [Fact]
    public void Proyecto_Should_Create_With_Valid_Data()
    {
        // Arrange
        var nombre = "Proyecto A";
        var ubicacion = "Ciudad B";
        var usuarioId = Guid.NewGuid();

        // Act
        var proyecto = new Proyecto(nombre, ubicacion, usuarioId);

        // Assert
        Assert.Equal(nombre, proyecto.Nombre);
        Assert.Equal(ubicacion, proyecto.UbicacionTexto);
        Assert.Equal(usuarioId, proyecto.UsuarioCreadorId);
        Assert.Equal(ProjectStatus.Draft, proyecto.EstadoProyecto);
        Assert.Equal(IntegrityStatus.Pending, proyecto.EstadoIntegridad);
        Assert.StartsWith("PRJ-", proyecto.CodigoInterno);
    }

    [Fact]
    public void Documento_Should_Create_With_Valid_Data()
    {
        // Arrange
        var proyectoId = Guid.NewGuid();
        var tipo = DocumentType.CertificadoTitulo;
        var nombreArchivo = "cedula.pdf";
        var ruta = "/docs/cedula.pdf";

        // Act
        var documento = new Documento(proyectoId, nombreArchivo, "application/pdf", 1000, ruta, tipo);

        // Assert
        Assert.Equal(proyectoId, documento.ProyectoId);
        Assert.Equal(tipo, documento.TipoDocumento);
        Assert.Equal(nombreArchivo, documento.NombreArchivoOriginal);
        Assert.Equal(ruta, documento.RutaArchivo);
        Assert.Equal(DocumentStatus.Uploaded, documento.EstadoDocumento);
    }
}
