namespace Domain.Entities;

public class PlanSuscripcion
{
    public Guid Idsuscripcion { get; set; }
    public string NombrePlan { get; set; } = null!;
    public decimal Precio { get; set; }
}
