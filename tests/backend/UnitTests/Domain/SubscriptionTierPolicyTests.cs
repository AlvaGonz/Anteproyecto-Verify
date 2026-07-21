namespace Tests.Unit.Domain;

using global::Domain.Entities;
using global::Domain.Enums;
using global::Domain.Policies;
using Xunit;
using Tests.Shared;
using System;

public class SubscriptionTierPolicyTests
{
    // ──────────────────────────────────────────────
    // Helpers — build test entities without full DB
    // ──────────────────────────────────────────────
    private static PlanSuscripcion MakePlan(
        int maxConsultas, int maxProyectos,
        bool esPublico = false, bool qr = false,
        bool multiUser = false, bool api = false)
        => PlanSuscripcion.Create(
            Guid.NewGuid(), "Test", 0m,
            maxConsultas, maxProyectos,
            esPublico, qr,
            multiUser ? 5 : 0, 100,
            false, false, false, false, false, false,
            "Comunidad", api);

    private static Usuario MakeUser(
        UserRole rol, PlanSuscripcion? plan = null,
        int consultasUsadas = 0)
    {
        var user = TestUsuarioFactory.Create(rol, plan, consultasUsadas);
        return user;
    }

    // ── CanConsult ──────────────────────────────────

    [Fact]
    public void CanConsult_AdminNoPlan_ReturnsTrue()
    {
        var admin = MakeUser(UserRole.Administrator, plan: null);
        Assert.True(SubscriptionTierPolicy.CanConsult(admin));
    }

    [Fact]
    public void CanConsult_AdminWithExhaustedPlan_StillReturnsTrue()
    {
        var plan = MakePlan(maxConsultas: 1, maxProyectos: 1);
        var admin = MakeUser(UserRole.Administrator, plan, consultasUsadas: 999);
        Assert.True(SubscriptionTierPolicy.CanConsult(admin));
    }

    [Fact]
    public void CanConsult_UserNoPlan_ReturnsFalse()
    {
        var user = MakeUser(UserRole.User, plan: null);
        Assert.False(SubscriptionTierPolicy.CanConsult(user));
    }

    [Fact]
    public void CanConsult_ConsultorAtLimit_ReturnsFalse()
    {
        var plan = MakePlan(maxConsultas: 1, maxProyectos: 1); // Consultor
        var user = MakeUser(UserRole.User, plan, consultasUsadas: 1);
        Assert.False(SubscriptionTierPolicy.CanConsult(user));
    }

    [Fact]
    public void CanConsult_ConsultorBelowLimit_ReturnsTrue()
    {
        var plan = MakePlan(maxConsultas: 1, maxProyectos: 1);
        var user = MakeUser(UserRole.User, plan, consultasUsadas: 0);
        Assert.True(SubscriptionTierPolicy.CanConsult(user));
    }

    [Fact]
    public void CanConsult_CorporativoPlan_UnlimitedSentinel_AlwaysTrue()
    {
        var plan = MakePlan(maxConsultas: -1, maxProyectos: 50); // Corporativo
        var user = MakeUser(UserRole.User, plan, consultasUsadas: 999999);
        Assert.True(SubscriptionTierPolicy.CanConsult(user));
    }

    // ── CanCreateProject ────────────────────────────

    [Fact]
    public void CanCreateProject_AdminNoPlan_ReturnsTrue()
    {
        var admin = MakeUser(UserRole.Administrator, plan: null);
        Assert.True(SubscriptionTierPolicy.CanCreateProject(admin, 9999));
    }

    [Fact]
    public void CanCreateProject_ConsultorAtLimit_ReturnsFalse()
    {
        var plan = MakePlan(maxConsultas: 1, maxProyectos: 1);
        var user = MakeUser(UserRole.User, plan);
        Assert.False(SubscriptionTierPolicy.CanCreateProject(user, 1));
    }

    [Fact]
    public void CanCreateProject_ProfesionalBelowLimit_ReturnsTrue()
    {
        var plan = MakePlan(maxConsultas: 25, maxProyectos: 5);
        var user = MakeUser(UserRole.User, plan);
        Assert.True(SubscriptionTierPolicy.CanCreateProject(user, 4));
    }

    [Fact]
    public void CanCreateProject_UserNoPlan_ReturnsFalse()
    {
        var user = MakeUser(UserRole.User, plan: null);
        Assert.False(SubscriptionTierPolicy.CanCreateProject(user, 0));
    }

    // ── IsProjectPublic ─────────────────────────────

    [Fact]
    public void IsProjectPublic_ConsultorPlan_ReturnsFalse()
    {
        var plan = MakePlan(1, 1, esPublico: false);
        var user = MakeUser(UserRole.User, plan);
        Assert.False(SubscriptionTierPolicy.IsProjectPublic(user));
    }

    [Fact]
    public void IsProjectPublic_ProfesionalPlan_ReturnsTrue()
    {
        var plan = MakePlan(25, 5, esPublico: true);
        var user = MakeUser(UserRole.User, plan);
        Assert.True(SubscriptionTierPolicy.IsProjectPublic(user));
    }

    [Fact]
    public void IsProjectPublic_AdminNoPlan_ReturnsTrue()
    {
        var admin = MakeUser(UserRole.Administrator, plan: null);
        Assert.True(SubscriptionTierPolicy.IsProjectPublic(admin));
    }

    // ── CanViewPublicProject ──────────────────────

    [Fact]
    public void CanViewPublicProject_Admin_ReturnsTrue()
    {
        var admin = MakeUser(UserRole.Administrator, plan: null);
        var projectOwnerId = Guid.NewGuid();
        Assert.True(SubscriptionTierPolicy.CanViewPublicProject(admin, projectOwnerId));
    }

    [Fact]
    public void CanViewPublicProject_ProjectOwner_ReturnsTrueEvenAtLimit()
    {
        var plan = MakePlan(maxConsultas: 1, maxProyectos: 1);
        var owner = MakeUser(UserRole.User, plan, consultasUsadas: 1);
        var projectOwnerId = owner.Id;
        Assert.True(SubscriptionTierPolicy.CanViewPublicProject(owner, projectOwnerId));
    }

    [Fact]
    public void CanViewPublicProject_UserUnderQuota_ReturnsTrue()
    {
        var plan = MakePlan(maxConsultas: 5, maxProyectos: 5);
        var user = MakeUser(UserRole.User, plan, consultasUsadas: 2);
        var projectOwnerId = Guid.NewGuid();
        Assert.True(SubscriptionTierPolicy.CanViewPublicProject(user, projectOwnerId));
    }

    [Fact]
    public void CanViewPublicProject_UserAtQuota_ReturnsFalse()
    {
        var plan = MakePlan(maxConsultas: 1, maxProyectos: 1);
        var user = MakeUser(UserRole.User, plan, consultasUsadas: 1);
        var projectOwnerId = Guid.NewGuid();
        Assert.False(SubscriptionTierPolicy.CanViewPublicProject(user, projectOwnerId));
    }

    [Fact]
    public void CanViewPublicProject_UserOverQuota_ReturnsFalse()
    {
        var plan = MakePlan(maxConsultas: 1, maxProyectos: 1);
        var user = MakeUser(UserRole.User, plan, consultasUsadas: 2);
        var projectOwnerId = Guid.NewGuid();
        Assert.False(SubscriptionTierPolicy.CanViewPublicProject(user, projectOwnerId));
    }

    [Fact]
    public void CanViewPublicProject_UserNoPlan_ReturnsFalse()
    {
        var user = MakeUser(UserRole.User, plan: null);
        var projectOwnerId = Guid.NewGuid();
        Assert.False(SubscriptionTierPolicy.CanViewPublicProject(user, projectOwnerId));
    }

    [Fact]
    public void CanViewPublicProject_CorporativoUnlimited_ReturnsTrue()
    {
        var plan = MakePlan(maxConsultas: -1, maxProyectos: 50);
        var user = MakeUser(UserRole.User, plan, consultasUsadas: 999999);
        var projectOwnerId = Guid.NewGuid();
        Assert.True(SubscriptionTierPolicy.CanViewPublicProject(user, projectOwnerId));
    }
}

