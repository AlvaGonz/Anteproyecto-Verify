using System.Threading;
using System.Threading.Tasks;
using Application.Features.Auth.Commands.RegisterUser;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Abstractions.Notifications;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using FluentValidation.Results;
using Moq;
using Xunit;
using Tests.Shared;

namespace UnitTests.Application.Features.Auth;

public class RegisterUserCommandHandlerTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IPlanSuscripcionRepository> _planRepo = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IEmailService> _emailSvc = new();
    private readonly Mock<IValidator<RegisterUserCommand>> _validator = new();

    private RegisterUserCommandHandler CreateSut() =>
        new(_usuarioRepo.Object, _passwordHasher.Object, _uow.Object, _validator.Object, _emailSvc.Object, _planRepo.Object);

    private void SetupDefaults()
    {
        var plan = TestPlanFactory.Consultor();
        _planRepo.Setup(r => r.GetByNameAsync("Consultor", default))
            .ReturnsAsync(plan);
        _usuarioRepo.Setup(r => r.AddAsync(It.IsAny<Usuario>(), default))
            .Returns(Task.CompletedTask);
        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);
        _passwordHasher.Setup(p => p.HashPassword(It.IsAny<string>())).Returns("hash");
        _validator.Setup(v => v.ValidateAsync(It.IsAny<RegisterUserCommand>(), default))
            .ReturnsAsync(new ValidationResult());
        _usuarioRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>(), default))
            .ReturnsAsync((Usuario?)null);
    }

    [Fact]
    public async Task Handle_WithPendingPlan_SetsPendingPlanFieldsOnUser()
    {
        SetupDefaults();

        Usuario? capturedUser = null;
        _usuarioRepo.Setup(r => r.AddAsync(It.IsAny<Usuario>(), default))
            .Callback<Usuario, CancellationToken>((u, _) => capturedUser = u)
            .Returns(Task.CompletedTask);

        var cmd = new RegisterUserCommand(
            "Juan", "Perez", "juan@test.com", "Test1234!", "8090000000", "00100000000",
            PendingPlanCode: "profesional", PendingBillingCycle: "monthly");

        var sut = CreateSut();
        var result = await sut.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.NotNull(capturedUser);
        Assert.Equal("profesional", capturedUser!.PendingPlanCode);
        Assert.Equal("monthly", capturedUser.PendingBillingCycle);
    }

    [Fact]
    public async Task Handle_WithoutPendingPlan_DoesNotSetPendingPlanFields()
    {
        SetupDefaults();

        Usuario? capturedUser = null;
        _usuarioRepo.Setup(r => r.AddAsync(It.IsAny<Usuario>(), default))
            .Callback<Usuario, CancellationToken>((u, _) => capturedUser = u)
            .Returns(Task.CompletedTask);

        var cmd = new RegisterUserCommand(
            "Juan", "Perez", "juan@test.com", "Test1234!", "8090000000", "00100000000");

        var sut = CreateSut();
        await sut.Handle(cmd, default);

        Assert.NotNull(capturedUser);
        Assert.Null(capturedUser!.PendingPlanCode);
        Assert.Null(capturedUser.PendingBillingCycle);
    }
}
