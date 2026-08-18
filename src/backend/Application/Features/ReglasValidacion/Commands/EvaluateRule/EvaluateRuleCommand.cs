namespace Application.Features.ReglasValidacion.Commands.EvaluateRule;

using System;

public class EvaluateRuleCommand
{
    public Guid ReglaId { get; set; }
    public Guid ProyectoId { get; set; }
    public decimal SuperficieProyecto { get; set; }
    public decimal SuperficieCatastro { get; set; }
}

public class ResultadoEvaluacionDto
{
    public Guid ReglaId { get; set; }
    public string ReglaNombre { get; set; } = string.Empty;
    public string? ReglaCodigo { get; set; }
    public bool Cumple { get; set; }
    public string NivelAlerta { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public decimal ValorCalculado { get; set; }
    public decimal ValorUmbral { get; set; }
    public decimal SuperficieProyecto { get; set; }
    public decimal SuperficieCatastro { get; set; }
    public decimal DiferenciaAbsoluta { get; set; }
}
