using System;
using System.Collections.Generic;

namespace Application.DTOs.Admin
{
    public record DashboardStatsDto
    {
        public int TotalUsuarios { get; init; }
        public int SuscripcionesActivas { get; init; }
        public decimal IngresosMensualesEstimados { get; init; }
        public List<SuscripcionRecienteDto> SuscripcionesRecientes { get; init; } = new();
        public List<ProyectoRecienteDto> ProyectosRecientes { get; init; } = new();
        public int TotalProyectos { get; init; }
        public int ProyectosPendientes { get; init; }
        public int ProyectosAprobados { get; init; }
        public int ProyectosRechazados { get; init; }

        // User Flow Stats
        public Dictionary<string, int> UsuariosPorPlan { get; init; } = new();
        public int TotalConsultasRealizadas { get; init; }
        public int TotalProyectosRegistrados { get; init; }
        public int TotalIntereses { get; init; }

        // Trend
        public List<ProyectosPorMesDto> ProyectosPorMes { get; init; } = new();
        public List<UsuariosPorMesDto> UsuariosPorMes { get; init; } = new();
    }

    public record SuscripcionRecienteDto
    {
        public DateTime FechaAlta { get; init; }
        public string Plan { get; init; } = string.Empty;
        public string Correo { get; init; } = string.Empty;
        public string Estado { get; init; } = string.Empty;
    }

    public record ProyectoRecienteDto
    {
        public DateTime FechaRegistro { get; init; }
        public string Nombre { get; init; } = string.Empty;
        public string Desarrollador { get; init; } = string.Empty;
        public string Estado { get; init; } = string.Empty;
        public string? ImagenUrl { get; init; }
    }

    public record ProyectosPorMesDto
    {
        public int Year { get; init; }
        public int Month { get; init; }
        public int Count { get; init; }
    }

    public record UsuariosPorMesDto
    {
        public int Year { get; init; }
        public int Month { get; init; }
        public int Count { get; init; }
    }
}
