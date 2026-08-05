using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Features.Auth.Commands.VerifyEmail;
using Application.Abstractions.Notifications;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Moq;
using Xunit;

namespace UnitTests.Application.Features.Auth;

public class VerifyEmailCommandHandlerTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IUnitOfWork> _uow = new();

    private VerifyEmailCommandHandler CreateSut() =>
        new(_usuarioRepo.Object, _uow.Object,
            new Mock<INotificationFactory>().Object,
            new Mock<INotificacionRepository>().Object);

    private static Usuario MakeUser(Action<Usuario>? configure = null)
    {
        var user = new Usuario("Juan", "Perez", "juan@test.com", "hash", Domain.Enums.UserRole.User, "8090000000", "00100000000");
        user.GetType().GetProperty("EmailVerificado")!.SetValue(user, false);
        user.GetType().GetProperty("TokenVerificacion")!.SetValue(user, "valid-token");
        user.GetType().GetProperty("TokenVerificacionExpiraUtc")!.SetValue(user, DateTime.UtcNow.AddHours(1));
        configure?.Invoke(user);
        return user;
    }

    [Fact]
    public async Task Handle_UserHasPendingPlanAndNoSubscription_ReturnsNextStepCheckout()
    {
        // ponytail: testing the core routing logic — nextStep is the behavioral change
        var user = MakeUser(u =>
        {
            u.GetType().GetProperty("PendingPlanCode")!.SetValue(u, "profesional");
            u.GetType().GetProperty("SubscriptionStatus")!.SetValue(u, null);
        });

        _usuarioRepo.Setup(r => r.GetByVerificationTokenAsync("valid-token", default))
            .ReturnsAsync(user);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var cmd = new VerifyEmailCommand("valid-token");
        var sut = CreateSut();

        var result = await sut.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.Equal("checkout", result.NextStep);
    }

    [Fact]
    public async Task Handle_UserHasActiveSubscription_ReturnsNextStepDashboard()
    {
        var user = MakeUser(u =>
        {
            u.GetType().GetProperty("PendingPlanCode")!.SetValue(u, "profesional");
            u.GetType().GetProperty("SubscriptionStatus")!.SetValue(u, "active");
        });

        _usuarioRepo.Setup(r => r.GetByVerificationTokenAsync("valid-token", default))
            .ReturnsAsync(user);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var cmd = new VerifyEmailCommand("valid-token");
        var sut = CreateSut();

        var result = await sut.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.Equal("dashboard", result.NextStep);
    }

    [Fact]
    public async Task Handle_UserHasNoPendingPlan_ReturnsNextStepChoosePlan()
    {
        var user = MakeUser(u =>
        {
            u.GetType().GetProperty("SubscriptionStatus")!.SetValue(u, null);
        });

        _usuarioRepo.Setup(r => r.GetByVerificationTokenAsync("valid-token", default))
            .ReturnsAsync(user);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var cmd = new VerifyEmailCommand("valid-token");
        var sut = CreateSut();

        var result = await sut.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.Equal("choose-plan", result.NextStep);
    }

    [Fact]
    public async Task Handle_UserWithoutPendingPlanButActiveSub_ReturnsNextStepDashboard()
    {
        var user = MakeUser(u =>
        {
            u.GetType().GetProperty("SubscriptionStatus")!.SetValue(u, "active");
        });

        _usuarioRepo.Setup(r => r.GetByVerificationTokenAsync("valid-token", default))
            .ReturnsAsync(user);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

        var cmd = new VerifyEmailCommand("valid-token");
        var sut = CreateSut();

        var result = await sut.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.Equal("dashboard", result.NextStep);
    }
}

