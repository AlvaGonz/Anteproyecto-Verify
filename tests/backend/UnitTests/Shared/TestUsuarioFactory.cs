namespace Tests.Shared;

using Domain.Entities;
using Domain.Enums;
using System;
using System.Reflection;

public static class TestUsuarioFactory
{
    public static Usuario Create(
        UserRole rol,
        PlanSuscripcion? plan = null,
        int consultasUsadas = 0)
    {
        // Add a mock user with reflection setting
        var user = new Usuario(
            "Test", "User", $"{Guid.NewGuid()}@test.com",
            "hashedpw", rol, "8091234567", "001-0000001-1");

        if (plan is not null)
            user.AsignarPlan(plan.Idsuscripcion);

        // Use reflection to set navigation property and ConsultasUsadas:
        typeof(Usuario)
            .GetProperty(nameof(Usuario.Plan))!
            .SetValue(user, plan);
        typeof(Usuario)
            .GetProperty(nameof(Usuario.ConsultasUsadas))!
            .SetValue(user, consultasUsadas);

        return user;
    }
}
