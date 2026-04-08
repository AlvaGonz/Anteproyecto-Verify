namespace Domain.Entities;

using System;
using System.Collections.Generic;
using Domain.Common;
using Domain.Enums;

public class Proyecto : EntityBase
{
    public string CodigoInterno { get; private set; }
    public string Nombre { get; private set; }
    public string UbicacionTexto { get; private set; }
    public string? UbicacionGps { get; private set; }
    public decimal? ValorEstimado { get; private set; }
    public string? DatosDesarrollador { get; private set; }
    public ProjectCategory Categoria { get; private set; }
    public string? DesignacionCatastral { get; private set; }
    public EstadoJuridico EstadoJuridico { get; private set; } = EstadoJuridico.Pendiente;
    public ProjectStatus EstadoProyecto { get; private set; }
    public IntegrityStatus EstadoIntegridad { get; private set; }
    
    public Guid UsuarioCreadorId { get; private set; }
    public Usuario UsuarioCreador { get; private set; } = null!;

    // Navigation properties
    public ICollection<Documento> Documentos { get; private set; } = new List<Documento>();
    public ICollection<Validacion> Validaciones { get; private set; } = new List<Validacion>();
    public ICollection<Hallazgo> Hallazgos { get; private set; } = new List<Hallazgo>();
    public ICollection<Auditoria> Auditorias { get; private set; } = new List<Auditoria>();
    public ICollection<Reporte> Reportes { get; private set; } = new List<Reporte>();

    private Proyecto() { } // For EF Core

    public Proyecto(string nombre, string ubicacionTexto, Guid usuarioCreadorId, ProjectCategory categoria = ProjectCategory.Residencial, string? datosDesarrollador = null, string? designacionCatastral = null)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(ubicacionTexto)) throw new ArgumentException("Ubicación requerida", nameof(ubicacionTexto));
        if (usuarioCreadorId == Guid.Empty) throw new ArgumentException("Usuario creador requerido", nameof(usuarioCreadorId));

        Nombre = nombre;
        UbicacionTexto = ubicacionTexto;
        UsuarioCreadorId = usuarioCreadorId;
        Categoria = categoria;
        DatosDesarrollador = datosDesarrollador;
        DesignacionCatastral = designacionCatastral;
        CodigoInterno = GenerateCode();
        EstadoProyecto = ProjectStatus.Draft;
        EstadoIntegridad = IntegrityStatus.Pending;
    }

    public void UpdateDetails(string nombre, string ubicacionTexto, string? ubicacionGps, decimal? valorEstimado, ProjectCategory categoria, string? datosDesarrollador, string? designacionCatastral)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(ubicacionTexto)) throw new ArgumentException("Ubicación requerida", nameof(ubicacionTexto));
        
        Nombre = nombre;
        UbicacionTexto = ubicacionTexto;
        UbicacionGps = ubicacionGps;
        ValorEstimado = valorEstimado;
        Categoria = categoria;
        DatosDesarrollador = datosDesarrollador;
        DesignacionCatastral = designacionCatastral;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateStatus(ProjectStatus newStatus)
    {
        EstadoProyecto = newStatus;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateEstadoJuridico(EstadoJuridico newStatus)
    {
        EstadoJuridico = newStatus;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    private string GenerateCode()
    {
        return $"PRJ-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}";
    }
}
