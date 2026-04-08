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

    public Proyecto(string nombre, string ubicacionTexto, Guid usuarioCreadorId)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(ubicacionTexto)) throw new ArgumentException("Ubicación requerida", nameof(ubicacionTexto));
        if (usuarioCreadorId == Guid.Empty) throw new ArgumentException("Usuario creador requerido", nameof(usuarioCreadorId));

        Nombre = nombre;
        UbicacionTexto = ubicacionTexto;
        UsuarioCreadorId = usuarioCreadorId;
        CodigoInterno = GenerateCode();
        EstadoProyecto = ProjectStatus.Draft;
        EstadoIntegridad = IntegrityStatus.Pending;
    }

    public void UpdateDetails(string nombre, string ubicacionTexto, string? ubicacionGps, decimal? valorEstimado)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("Nombre requerido", nameof(nombre));
        if (string.IsNullOrWhiteSpace(ubicacionTexto)) throw new ArgumentException("Ubicación requerida", nameof(ubicacionTexto));
        
        Nombre = nombre;
        UbicacionTexto = ubicacionTexto;
        UbicacionGps = ubicacionGps;
        ValorEstimado = valorEstimado;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateStatus(ProjectStatus newStatus)
    {
        EstadoProyecto = newStatus;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    private string GenerateCode()
    {
        return $"PRJ-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}";
    }
}
