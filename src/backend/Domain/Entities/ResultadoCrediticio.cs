namespace Domain.Entities;

using System;
using Domain.Common;
using Domain.Enums;

public class ResultadoCrediticio : EntityBase
{
    public Guid ProyectoId { get; private set; }
    public Proyecto Proyecto { get; private set; } = null!;
    
    public Guid ConsentimientoId { get; private set; }
    public ConsentimientoFinanciero Consentimiento { get; private set; } = null!;

    public int ScoreCrediticio { get; private set; }
    public decimal PorcentajeEndeudamiento { get; private set; }
    public int CantidadAtrasosUltimos12Meses { get; private set; }
    public NivelRiesgoCrediticio NivelRiesgo { get; private set; }
    public DateTime FechaConsultaUtc { get; private set; }

    private ResultadoCrediticio() { } // For EF Core

    public ResultadoCrediticio(
        Guid proyectoId, 
        Guid consentimientoId, 
        int scoreCrediticio, 
        decimal porcentajeEndeudamiento, 
        int cantidadAtrasosUltimos12Meses,
        NivelRiesgoCrediticio nivelRiesgo)
    {
        if (proyectoId == Guid.Empty) throw new ArgumentException("Proyecto requerido", nameof(proyectoId));
        if (consentimientoId == Guid.Empty) throw new ArgumentException("Consentimiento requerido", nameof(consentimientoId));

        ProyectoId = proyectoId;
        ConsentimientoId = consentimientoId;
        ScoreCrediticio = scoreCrediticio;
        PorcentajeEndeudamiento = porcentajeEndeudamiento;
        CantidadAtrasosUltimos12Meses = cantidadAtrasosUltimos12Meses;
        NivelRiesgo = nivelRiesgo;
        FechaConsultaUtc = DateTime.UtcNow;
    }
}
