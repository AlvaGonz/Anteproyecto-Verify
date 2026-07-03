namespace Tests.Shared;

using Domain.Entities;
using System;

public static class TestPlanFactory
{
    public static PlanSuscripcion Consultor() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Consultor", 0m,
        1, 1, false, false, 0, 100, false, false, false, false, false, false, "Comunidad", false);

    public static PlanSuscripcion Profesional() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Profesional", 60m,
        25, 5, true, true, 2, 500, true, false, false, false, false, false, "Email", false);

    public static PlanSuscripcion Empresa() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Empresa", 170m,
        100, 10, true, true, 5, 2048, true, true, false, true, true, false, "Prioritario", true);

    public static PlanSuscripcion Enterprise() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Enterprise", 500m,
        -1, 50, true, true, 20, 10240, true, true, true, true, true, true, "Dedicado", true);
}
