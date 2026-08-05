namespace Domain.Entities;

using System;
using System.Collections.Generic;
using Domain.Common;
using Domain.Enums;

public class Proyecto : EntityBase
{
    public string CodigoInterno { get; private set; } = null!;
    public string Nombre { get; private set; } = null!;
    public string UbicacionTexto { get; private set; } = null!;
    public string? UbicacionGps { get; private set; }
    public decimal? ValorEstimado { get; private set; }
    public string? DatosDesarrollador { get; private set; }
    public string? RncDesarrollador { get; private set; }
    public string? Matricula { get; private set; }
    public int CategoriaId { get; private set; }
    public CategoriaProyecto CategoriaProyecto { get; private set; } = null!;
    public string? DesignacionCatastral { get; private set; }
    public string? Ipi { get; private set; }
    public string? ImagenUrl { get; private set; }
    public string? ImagenAdicional1 { get; private set; }
    public string? ImagenAdicional2 { get; private set; }
    public string? ImagenAdicional3 { get; private set; }
    public string? ImagenAdicional4 { get; private set; }
    public string? ImagenAdicional5 { get; private set; }
    public string? IdentificacionCatastral => DesignacionCatastral;
    public string? Propietario { get; private set; }
    public string? CedulaRncPropietario { get; private set; }
    public string? EstatusIpi { get; private set; }
    public decimal? SuperficieM2 { get; private set; }
    public string EstatusDescripcion => Estado?.Nombre ?? "Desconocido";
    public Guid PromotorId => UsuarioCreadorId;
    public string? RncPromotor => RncDesarrollador;
    public EstadoJuridico EstadoJuridico { get; private set; } = EstadoJuridico.Pendiente;
    public Guid EstadoId { get; private set; }
    public ProyectoEstado Estado { get; private set; } = null!;
    public IntegrityStatus EstadoIntegridad { get; private set; }
    public bool SelladoBloqueado { get; private set; }
    
    public Guid UsuarioCreadorId { get; private set; }
    public Usuario UsuarioCreador { get; private set; } = null!;

    public Guid? ProvinciaId { get; private set; }
    public Provincia? Provincia { get; private set; }

    // Navigation properties
    public ICollection<Documento> Documentos { get; private set; } = new List<Documento>();
    public ICollection<Validacion> Validaciones { get; private set; } = new List<Validacion>();
    public ICollection<Hallazgo> Hallazgos { get; private set; } = new List<Hallazgo>();
    public ICollection<Auditoria> Auditorias { get; private set; } = new List<Auditoria>();
    public ICollection<Reporte> Reportes { get; private set; } = new List<Reporte>();

    private Proyecto() { } // For EF Core

    public Proyecto(string nombre, string ubicacionTexto, Guid usuarioCreadorId, int categoriaId, string? datosDesarrollador = null, string? designacionCatastral = null, string? propietario = null, string? cedulaRncPropietario = null, string? ipi = null, string? estatusIpi = null, decimal? superficieM2 = null, string? imagenUrl = null, string? img1 = null, string? img2 = null, string? img3 = null, string? img4 = null, string? img5 = null, Guid? provinciaId = null)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(ubicacionTexto)) throw new ArgumentException("Ubicación requerida", nameof(ubicacionTexto));
        if (usuarioCreadorId == Guid.Empty) throw new ArgumentException("Usuario creador requerido", nameof(usuarioCreadorId));

        Nombre = nombre;
        UbicacionTexto = ubicacionTexto;
        UsuarioCreadorId = usuarioCreadorId;
        CategoriaId = categoriaId;
        DatosDesarrollador = datosDesarrollador;
        DesignacionCatastral = designacionCatastral;
        Propietario = propietario;
        CedulaRncPropietario = cedulaRncPropietario;
        Ipi = ipi;
        EstatusIpi = estatusIpi;
        SuperficieM2 = superficieM2;
        ImagenUrl = imagenUrl;
        ImagenAdicional1 = img1;
        ImagenAdicional2 = img2;
        ImagenAdicional3 = img3;
        ImagenAdicional4 = img4;
        ImagenAdicional5 = img5;
        ProvinciaId = provinciaId;
        CodigoInterno = GenerateCode();
        EstadoIntegridad = IntegrityStatus.Pending;
    }

    public void UpdateDetails(string nombre, string ubicacionTexto, string? ubicacionGps, decimal? valorEstimado, int categoriaId, string? datosDesarrollador, string? designacionCatastral, string? propietario = null, string? cedulaRncPropietario = null, string? ipi = null, string? estatusIpi = null, decimal? superficieM2 = null, string? imagenUrl = null, string? img1 = null, string? img2 = null, string? img3 = null, string? img4 = null, string?         img5 = null, Guid? provinciaId = null)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(ubicacionTexto)) throw new ArgumentException("Ubicación requerida", nameof(ubicacionTexto));
        
        Nombre = nombre;
        UbicacionTexto = ubicacionTexto;
        UbicacionGps = ubicacionGps;
        ValorEstimado = valorEstimado;
        CategoriaId = categoriaId;
        DatosDesarrollador = datosDesarrollador;
        DesignacionCatastral = designacionCatastral;
        Propietario = propietario;
        CedulaRncPropietario = cedulaRncPropietario;
        Ipi = ipi;
        EstatusIpi = estatusIpi;
        SuperficieM2 = superficieM2;
        ImagenUrl = imagenUrl;
        ImagenAdicional1 = img1;
        ImagenAdicional2 = img2;
        ImagenAdicional3 = img3;
        ImagenAdicional4 = img4;
        ImagenAdicional5 = img5;
        ProvinciaId = provinciaId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateEstado(Guid nuevoEstadoId)
    {
        EstadoId = nuevoEstadoId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateEstado(ProyectoEstado nuevoEstado)
    {
        if (nuevoEstado == null) throw new ArgumentNullException(nameof(nuevoEstado));
        EstadoId = nuevoEstado.Id;
        Estado = nuevoEstado;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateEstadoJuridico(EstadoJuridico newStatus)
    {
        EstadoJuridico = newStatus;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetSelladoBloqueado(bool bloqueado)
    {
        SelladoBloqueado = bloqueado;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateRncYMatricula(string? rnc, string? matricula)
    {
        RncDesarrollador = rnc;
        Matricula = matricula;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AsignarCategoria(CategoriaProyecto categoria)
    {
        if (categoria == null) throw new ArgumentNullException(nameof(categoria));
        CategoriaId = categoria.Id;
        CategoriaProyecto = categoria;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetImagenUrl(string url)
    {
        ImagenUrl = url;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateEstatusIpi(string estatus)
    {
        EstatusIpi = estatus;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    private string GenerateCode()
    {
        return $"PRJ-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}";
    }


}
