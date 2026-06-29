namespace Domain.Entities;

using System;

public class PlanSuscripcion
{
    public Guid Idsuscripcion { get; private set; }
    public string NombrePlan { get; private set; } = null!;
    public decimal Precio { get; private set; }

    // Capability limits
    public int MaxConsultas { get; private set; }
    public int MaxProyectos { get; private set; }
    public bool PresentacionPublica { get; private set; }
    public bool QrIncluido { get; private set; }
    public bool MultiUsuario { get; private set; }
    public bool AccesoApi { get; private set; }

    private PlanSuscripcion() { } // For EF Core

    public static PlanSuscripcion Create(
        Guid id, string nombrePlan, decimal precio,
        int maxConsultas, int maxProyectos, bool presentacionPublica,
        bool qrIncluido, bool multiUsuario, bool accesoApi)
    {
        return new PlanSuscripcion
        {
            Idsuscripcion = id,
            NombrePlan = nombrePlan,
            Precio = precio,
            MaxConsultas = maxConsultas,
            MaxProyectos = maxProyectos,
            PresentacionPublica = presentacionPublica,
            QrIncluido = qrIncluido,
            MultiUsuario = multiUsuario,
            AccesoApi = accesoApi
        };
    }

    public bool HasConsultasDisponibles(int consultasUsadas)
    {
        return MaxConsultas == -1 || consultasUsadas < MaxConsultas;
    }

    public bool HasProyectosDisponibles(int proyectosActuales)
    {
        return MaxProyectos == -1 || proyectosActuales < MaxProyectos;
    }
}
