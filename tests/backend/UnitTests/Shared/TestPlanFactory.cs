namespace Tests.Shared;

using Domain.Entities;
using System;

public static class TestPlanFactory
{
    public static PlanSuscripcion Consultor() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Consultor", 0m,
        1, 1, false, false, false, false);

    public static PlanSuscripcion Profesional() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Profesional", 3500m,
        25, 5, true, true, false, false);

    public static PlanSuscripcion Empresa() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Empresa", 10000m,
        100, 10, true, true, false, false);

    public static PlanSuscripcion Enterprise() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Enterprise", 30000m,
        -1, 50, true, true, true, true);
}
