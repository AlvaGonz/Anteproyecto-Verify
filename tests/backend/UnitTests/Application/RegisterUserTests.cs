namespace Tests.Unit.Application;

using global::Application.Features.Auth.Commands.RegisterUser;
using global::Application.Abstractions.Persistence;
using global::Application.Abstractions.Security;
using global::Domain.Entities;
using global::Domain.Enums;
using Moq;
using Xunit;
using Tests.Shared;
using System.Threading;
using System.Threading.Tasks;
using System;
using global::Application.Abstractions.Notifications;
using FluentValidation;

public class RegisterUserTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IPlanSuscripcionRepository> _planRepo = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IEmailService> _emailSvc = new();
    private readonly Mock<IValidator<RegisterUserCommand>> _validator = new();
    
    private RegisterUserCommandHandler CreateSut() =>
        new(_usuarioRepo.Object, _passwordHasher.Object, _uow.Object, _validator.Object, _emailSvc.Object, _planRepo.Object);

    [Fact]
    public async Task RegisterUser_SelfRegistered_GetsUserRoleNotAdmin()
    {
        var plan = TestPlanFactory.Consultor();
        _planRepo.Setup(r => r.GetByNameAsync("Consultor", default))
            .ReturnsAsync(plan);

        Usuario? capturedUser = null;
        _usuarioRepo.Setup(r => r.AddAsync(It.IsAny<Usuario>(), default))
            .Callback<Usuario, CancellationToken>((u, _) => capturedUser = u)
            .Returns(Task.CompletedTask);

        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);
        _passwordHasher.Setup(p => p.HashPassword(It.IsAny<string>())).Returns("hash");
        _validator.Setup(v => v.ValidateAsync(It.IsAny<RegisterUserCommand>(), default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        var cmd = new RegisterUserCommand("Juan", "Perez", "juan@test.com", "Test1234!", "8090000000", "00100000000");
        var sut = CreateSut();
        
        await sut.Handle(cmd, default);

        Assert.NotNull(capturedUser);
        Assert.Equal(UserRole.User, capturedUser!.Rol);
        Assert.NotEqual(UserRole.Administrator, capturedUser.Rol);
    }

    [Fact]
    public async Task RegisterUser_PlanConsultorExists_AssignedToPlan()
    {
        var plan = TestPlanFactory.Consultor();
        _planRepo.Setup(r => r.GetByNameAsync("Consultor", default))
            .ReturnsAsync(plan);

        Usuario? capturedUser = null;
        _usuarioRepo.Setup(r => r.AddAsync(It.IsAny<Usuario>(), default))
            .Callback<Usuario, CancellationToken>((u, _) => capturedUser = u)
            .Returns(Task.CompletedTask);

        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);
        _passwordHasher.Setup(p => p.HashPassword(It.IsAny<string>())).Returns("hash");
        _validator.Setup(v => v.ValidateAsync(It.IsAny<RegisterUserCommand>(), default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        var cmd = new RegisterUserCommand("Juan", "Perez", "juan2@test.com", "Test1234!", "8090000000", "00100000000");
        var sut = CreateSut();
        
        await sut.Handle(cmd, default);

        Assert.NotNull(capturedUser);
        Assert.Equal(plan.Idsuscripcion, capturedUser!.PlanSuscripcionId);
    }

    [Fact]
    public async Task RegisterUser_NoPlanInDb_UserCreatedWithoutPlan()
    {
        _planRepo.Setup(r => r.GetByNameAsync("Consultor", default))
            .ReturnsAsync((PlanSuscripcion?)null);

        Usuario? capturedUser = null;
        _usuarioRepo.Setup(r => r.AddAsync(It.IsAny<Usuario>(), default))
            .Callback<Usuario, CancellationToken>((u, _) => capturedUser = u)
            .Returns(Task.CompletedTask);

        _uow.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);
        _passwordHasher.Setup(p => p.HashPassword(It.IsAny<string>())).Returns("hash");
        _validator.Setup(v => v.ValidateAsync(It.IsAny<RegisterUserCommand>(), default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        var cmd = new RegisterUserCommand("Juan", "Perez", "juan3@test.com", "Test1234!", "8090000000", "00100000000");
        var sut = CreateSut();
        
        await sut.Handle(cmd, default);

        Assert.NotNull(capturedUser);
        Assert.Null(capturedUser!.PlanSuscripcionId);
    }
}
