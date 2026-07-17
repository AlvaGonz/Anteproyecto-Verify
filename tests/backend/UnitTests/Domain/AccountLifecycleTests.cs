using global::Domain.Entities;
using global::Domain.Enums;
using Xunit;
using Tests.Shared;
using System;

public class AccountLifecycleTests
{
    // ── RequestDeletion ──────────────────────────────

    [Fact]
    public void RequestDeletion_SetsStatusAndDates()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        var before = DateTime.UtcNow;

        user.RequestDeletion("Ya no lo uso");

        Assert.Equal(UserAccountStatus.PendingDeletion, user.AccountStatus);
        Assert.False(user.Activo);
        Assert.NotNull(user.DeletedAtUtc);
        Assert.NotNull(user.RecoverUntilUtc);
        Assert.NotNull(user.PurgeAtUtc);
        Assert.Equal("Ya no lo uso", user.DeletionReason);
        Assert.True(user.DeletedAtUtc >= before);
        Assert.True(user.RecoverUntilUtc - user.DeletedAtUtc >= TimeSpan.FromDays(13));
        Assert.True(user.PurgeAtUtc - user.DeletedAtUtc >= TimeSpan.FromDays(29));
    }

    [Fact]
    public void RequestDeletion_WithoutReason_StillSucceeds()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);

        user.RequestDeletion(null);

        Assert.Equal(UserAccountStatus.PendingDeletion, user.AccountStatus);
        Assert.Null(user.DeletionReason);
    }

    [Fact]
    public void RequestDeletion_WhenAlreadyPending_Throws()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.RequestDeletion("Razon");

        var ex = Assert.Throws<InvalidOperationException>(() => user.RequestDeletion("Otra"));
        Assert.Contains("pendiente de eliminación", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void RequestDeletion_WhenPurged_Throws()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.RequestDeletion("Razon");
        // Force status to Purged (simulating purge job)
        typeof(Usuario).GetProperty(nameof(Usuario.AccountStatus))!
            .SetValue(user, UserAccountStatus.Purged);

        var ex = Assert.Throws<InvalidOperationException>(() => user.RequestDeletion("Otra"));
        Assert.Contains("purgada", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    // ── RecoverAccount ───────────────────────────────

    [Fact]
    public void RecoverAccount_WithinWindow_RestoresActive()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.RequestDeletion("Me equivoque");

        user.RecoverAccount();

        Assert.Equal(UserAccountStatus.Active, user.AccountStatus);
        Assert.True(user.Activo);
        Assert.Null(user.DeletedAtUtc);
        Assert.Null(user.RecoverUntilUtc);
        Assert.Null(user.PurgeAtUtc);
        Assert.Null(user.DeletionReason);
    }

    [Fact]
    public void RecoverAccount_AfterWindow_Throws()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.RequestDeletion("Razon");

        // Simulate recovery window expired
        typeof(Usuario).GetProperty(nameof(Usuario.RecoverUntilUtc))!
            .SetValue(user, DateTime.UtcNow.AddDays(-1));

        var ex = Assert.Throws<InvalidOperationException>(() => user.RecoverAccount());
        Assert.Contains("recuperación", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void RecoverAccount_WhenNotPending_Throws()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);

        var ex = Assert.Throws<InvalidOperationException>(() => user.RecoverAccount());
        Assert.Contains("no está pendiente", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    // ── IsWithinRecoveryWindow ────────────────────────

    [Fact]
    public void IsWithinRecoveryWindow_WithinWindow_ReturnsTrue()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.RequestDeletion("Test");

        Assert.True(user.IsWithinRecoveryWindow);
    }

    [Fact]
    public void IsWithinRecoveryWindow_AfterWindow_ReturnsFalse()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.RequestDeletion("Test");

        typeof(Usuario).GetProperty(nameof(Usuario.RecoverUntilUtc))!
            .SetValue(user, DateTime.UtcNow.AddDays(-1));

        Assert.False(user.IsWithinRecoveryWindow);
    }

    [Fact]
    public void IsWithinRecoveryWindow_WhenActive_ReturnsFalse()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);

        Assert.False(user.IsWithinRecoveryWindow);
    }

    // ── AnonymizePii ──────────────────────────────────

    [Fact]
    public void AnonymizePii_ReplacesNameEmailPhone()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        var originalEmail = user.CorreoElectronico;
        var originalName = user.Nombre;
        var originalPhone = user.Telefono;

        user.AnonymizePii();

        Assert.Equal("Usuario eliminado", user.Nombre);
        Assert.Equal("Usuario eliminado", user.Apellido);
        Assert.Equal("Usuario eliminado", user.NombreCompleto);
        Assert.NotEqual(originalEmail, user.CorreoElectronico);
        Assert.Contains("@anon.verifinca.do", user.CorreoElectronico);
        Assert.Null(user.Telefono);
        Assert.Equal(UserAccountStatus.Purged, user.AccountStatus);
    }

    [Fact]
    public void AnonymizePii_EmailHashIsDeterministic()
    {
        var user1 = TestUsuarioFactory.Create(UserRole.User);
        var user2 = TestUsuarioFactory.Create(UserRole.User);
        var email1 = user1.CorreoElectronico;
        var email2 = user2.CorreoElectronico;

        user1.AnonymizePii();
        user2.AnonymizePii();

        // Different original emails → different hashes
        Assert.NotEqual(user1.CorreoElectronico, user2.CorreoElectronico);
    }
}

