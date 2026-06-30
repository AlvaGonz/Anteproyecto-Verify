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
    public int MaxUsuariosSecundarios { get; private set; }
    public int MaxAlmacenamientoMb { get; private set; }
    public bool AlertasTiempoRealDisponible { get; private set; }
    public bool ModeloLmDisponible { get; private set; }
    public bool ValidacionLoteDisponible { get; private set; }
    public bool ExportacionExcelDisponible { get; private set; }
    public bool ExportacionPdfDisponible { get; private set; }
    public bool IntegracionCrmDisponible { get; private set; }
    public string SoporteTipo { get; private set; } = "Comunidad";
    public bool AccesoApi { get; private set; }

    private PlanSuscripcion() { } // For EF Core

    public static PlanSuscripcion Create(
        Guid id, string nombrePlan, decimal precio,
        int maxConsultas, int maxProyectos, bool presentacionPublica,
        bool qrIncluido, int maxUsuariosSecundarios, int maxAlmacenamientoMb,
        bool alertasTiempoRealDisponible, bool modeloLmDisponible, bool validacionLoteDisponible,
        bool exportacionExcelDisponible, bool exportacionPdfDisponible, bool integracionCrmDisponible,
        string soporteTipo, bool accesoApi)
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
            MaxUsuariosSecundarios = maxUsuariosSecundarios,
            MaxAlmacenamientoMb = maxAlmacenamientoMb,
            AlertasTiempoRealDisponible = alertasTiempoRealDisponible,
            ModeloLmDisponible = modeloLmDisponible,
            ValidacionLoteDisponible = validacionLoteDisponible,
            ExportacionExcelDisponible = exportacionExcelDisponible,
            ExportacionPdfDisponible = exportacionPdfDisponible,
            IntegracionCrmDisponible = integracionCrmDisponible,
            SoporteTipo = soporteTipo,
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
