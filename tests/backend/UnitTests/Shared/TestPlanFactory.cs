namespace Tests.Shared;

using Domain.Entities;
using System;

public static class TestPlanFactory
{
    public static PlanSuscripcion Consultor() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Consultor", 0m,
        1, 1, false, false, 0, 0, false, false, false, false, false, false, "Comunidad", false);

    public static PlanSuscripcion Profesional() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Profesional", 60m,
        25, 5, true, true, 0, 200, false, false, false, false, true, false, "Email", false);

    public static PlanSuscripcion Empresa() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Empresa", 170m,
        100, 30, true, true, 5, 1024, false, true, false, false, true, true, "Prioritario", true);

    public static PlanSuscripcion Corporativo() => PlanSuscripcion.Create(
        Guid.NewGuid(), "Corporativo", 500m,
        -1, 50, true, true, -1, 10240, true, true, true, true, true, true, "Account Manager", true);

    public static PlanSuscripcion Administrador() => PlanSuscripcion.Create(
        Guid.Parse("99999999-9999-9999-9999-999999999999"), "Administrador", 0.00m,
        -1, -1, true, true, -1, -1, true, true, true, true, true, true, "Account Manager", true);
}

