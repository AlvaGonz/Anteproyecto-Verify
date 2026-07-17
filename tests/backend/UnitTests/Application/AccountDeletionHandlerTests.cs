using global::Application.Features.Account.Commands.RequestAccountDeletion;
using global::Application.Features.Account.Commands.RecoverAccount;
using global::Application.Features.Account.Commands.PurgeAccounts;
using global::Application.Abstractions;
using global::Application.Abstractions.Persistence;
using global::Application.Abstractions.Security;
using global::Domain.Entities;
using global::Domain.Enums;
using Moq;
using Xunit;
using Tests.Shared;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

public class AccountDeletionHandlerTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IAuditLogger> _auditLogger = new();
    private readonly Mock<IStripeService> _stripeService = new();

    // ── RequestDeletion ──────────────────────────────

    [Fact]
    public async Task RequestDeletion_ValidRequest_SetsStatusAndReturnsConfirmation()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        var userId = user.Id;

        _usuarioRepo.Setup(r => r.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var cmd = new RequestAccountDeletionCommand(userId, "Ya no lo uso");
        var handler = new RequestAccountDeletionCommandHandler(
            _usuarioRepo.Object, _uow.Object, _auditLogger.Object, _stripeService.Object);

        var result = await handler.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.Equal(UserAccountStatus.PendingDeletion, user.AccountStatus);
        Assert.NotNull(user.DeletedAtUtc);
        _auditLogger.Verify(a => a.AppendAsync(It.IsAny<AuditEntryDto>(), default), Times.Once);
    }

    [Fact]
    public async Task RequestDeletion_WithActiveStripe_SchedulesCancellationAtPeriodEnd()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.UpdateStripeSubscription("cus_123", "sub_456", "active", DateTime.UtcNow.AddMonths(1));
        var userId = user.Id;

        _usuarioRepo.Setup(r => r.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);
        _stripeService.Setup(s => s.CancelAtPeriodEndAsync("sub_456", default))
            .ReturnsAsync(DateTime.UtcNow.AddMonths(1));

        var cmd = new RequestAccountDeletionCommand(userId, null);
        var handler = new RequestAccountDeletionCommandHandler(
            _usuarioRepo.Object, _uow.Object, _auditLogger.Object, _stripeService.Object);

        var result = await handler.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        _stripeService.Verify(s => s.CancelAtPeriodEndAsync("sub_456", default), Times.Once);
    }

    [Fact]
    public async Task RequestDeletion_WithoutActiveStripe_DoesNotCallStripe()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        var userId = user.Id;

        _usuarioRepo.Setup(r => r.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var cmd = new RequestAccountDeletionCommand(userId, null);
        var handler = new RequestAccountDeletionCommandHandler(
            _usuarioRepo.Object, _uow.Object, _auditLogger.Object, _stripeService.Object);

        await handler.Handle(cmd, default);

        _stripeService.Verify(s => s.CancelAtPeriodEndAsync(It.IsAny<string>(), default), Times.Never);
    }

    [Fact]
    public async Task RequestDeletion_UserNotFound_ReturnsError()
    {
        _usuarioRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), default))
            .ReturnsAsync((Usuario?)null);

        var cmd = new RequestAccountDeletionCommand(Guid.NewGuid(), null);
        var handler = new RequestAccountDeletionCommandHandler(
            _usuarioRepo.Object, _uow.Object, _auditLogger.Object, _stripeService.Object);

        var result = await handler.Handle(cmd, default);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.ErrorMessage);
    }

    // ── RecoverAccount ───────────────────────────────

    [Fact]
    public async Task RecoverAccount_WithinWindow_ReturnsSuccess()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.RequestDeletion("Test");
        var userId = user.Id;

        _usuarioRepo.Setup(r => r.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var cmd = new RecoverAccountCommand(userId);
        var handler = new RecoverAccountCommandHandler(
            _usuarioRepo.Object, _uow.Object, _auditLogger.Object);

        var result = await handler.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.Equal(UserAccountStatus.Active, user.AccountStatus);
        _auditLogger.Verify(a => a.AppendAsync(It.IsAny<AuditEntryDto>(), default), Times.Once);
    }

    [Fact]
    public async Task RecoverAccount_AfterWindow_ReturnsError()
    {
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.RequestDeletion("Test");
        var userId = user.Id;

        // Expire recovery window
        typeof(Usuario).GetProperty(nameof(Usuario.RecoverUntilUtc))!
            .SetValue(user, DateTime.UtcNow.AddDays(-1));

        _usuarioRepo.Setup(r => r.GetByIdAsync(userId, default))
            .ReturnsAsync(user);

        var cmd = new RecoverAccountCommand(userId);
        var handler = new RecoverAccountCommandHandler(
            _usuarioRepo.Object, _uow.Object, _auditLogger.Object);

        var result = await handler.Handle(cmd, default);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.ErrorMessage);
    }

    [Fact]
    public async Task RecoverAccount_UserNotFound_ReturnsError()
    {
        _usuarioRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), default))
            .ReturnsAsync((Usuario?)null);

        var cmd = new RecoverAccountCommand(Guid.NewGuid());
        var handler = new RecoverAccountCommandHandler(
            _usuarioRepo.Object, _uow.Object, _auditLogger.Object);

        var result = await handler.Handle(cmd, default);

        Assert.False(result.IsSuccess);
    }

    // ── PurgeAccounts ────────────────────────────────

    [Fact]
    public async Task PurgeAccounts_FindsAndAnonymizesEligible()
    {
        var user1 = TestUsuarioFactory.Create(UserRole.User);
        user1.RequestDeletion("R1");
        // Set purgeAt in the past
        typeof(Usuario).GetProperty(nameof(Usuario.PurgeAtUtc))!
            .SetValue(user1, DateTime.UtcNow.AddDays(-1));

        var user2 = TestUsuarioFactory.Create(UserRole.User);
        user2.RequestDeletion("R2");
        typeof(Usuario).GetProperty(nameof(Usuario.PurgeAtUtc))!
            .SetValue(user2, DateTime.UtcNow.AddDays(-1));

        var eligible = new List<Usuario> { user1, user2 };

        _usuarioRepo.Setup(r => r.GetPendingPurgeAsync(default))
            .ReturnsAsync(eligible);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(2);

        var cmd = new PurgeAccountsCommand();
        var handler = new PurgeAccountsCommandHandler(
            _usuarioRepo.Object, _uow.Object, _auditLogger.Object);

        var result = await handler.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.PurgedCount);
        Assert.Equal("Usuario eliminado", user1.Nombre);
        Assert.Contains("@anon.verifinca.do", user1.CorreoElectronico);
        Assert.Equal(UserAccountStatus.Purged, user1.AccountStatus);
        _auditLogger.Verify(a => a.AppendAsync(It.IsAny<AuditEntryDto>(), default), Times.Exactly(2));
    }

    [Fact]
    public async Task PurgeAccounts_NoEligible_Skips()
    {
        _usuarioRepo.Setup(r => r.GetPendingPurgeAsync(default))
            .ReturnsAsync(new List<Usuario>());

        var cmd = new PurgeAccountsCommand();
        var handler = new PurgeAccountsCommandHandler(
            _usuarioRepo.Object, _uow.Object, _auditLogger.Object);

        var result = await handler.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.Equal(0, result.PurgedCount);
        _auditLogger.Verify(a => a.AppendAsync(It.IsAny<AuditEntryDto>(), default), Times.Never);
    }
}

