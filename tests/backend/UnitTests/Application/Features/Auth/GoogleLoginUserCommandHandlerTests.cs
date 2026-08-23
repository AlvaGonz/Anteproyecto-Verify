using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Application.Features.Auth.Commands.GoogleLoginUser;
using Application.Features.Auth.Commands.LoginUser;
using Domain.Entities;
using Domain.Enums;
using Moq;
using Xunit;
using Tests.Shared;

namespace UnitTests.Application.Features.Auth;

public class GoogleLoginUserCommandHandlerTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IPlanSuscripcionRepository> _planRepo = new();
    private readonly Mock<IJwtTokenGenerator> _jwtGen = new();
    private readonly Mock<IGoogleAuthService> _googleAuth = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<ITwoFactorChallengeStore> _challengeStore = new();

    private GoogleLoginUserCommandHandler CreateSut() =>
        new(_usuarioRepo.Object, _jwtGen.Object, _googleAuth.Object, _planRepo.Object, _uow.Object, _challengeStore.Object);

    [Fact]
    public async Task Handle_InvalidToken_ReturnsFailure()
    {
        _googleAuth.Setup(g => g.VerifyTokenAsync(It.IsAny<string>(), default))
            .ReturnsAsync((GoogleUserProfile?)null);

        var cmd = new GoogleLoginUserCommand("invalid_credential");
        var sut = CreateSut();

        var result = await sut.Handle(cmd, default);

        Assert.False(result.IsSuccess);
        Assert.Equal("Token de Google inválido.", result.ErrorMessage);
    }

    [Fact]
    public async Task Handle_ValidToken_NewUser_CreatesUserAndReturnsSession()
    {
        var profile = new GoogleUserProfile { Sub = "123", Email = "new@test.com", Name = "New User", EmailVerified = true };
        _googleAuth.Setup(g => g.VerifyTokenAsync("valid_token", default)).ReturnsAsync(profile);
        _usuarioRepo.Setup(r => r.GetByEmailAsync("new@test.com", default)).ReturnsAsync((Usuario?)null);
        _jwtGen.Setup(j => j.GenerateToken(It.IsAny<Usuario>(), It.IsAny<bool>())).Returns("jwt_token");

        Usuario? capturedUser = null;
        _usuarioRepo.Setup(r => r.AddAsync(It.IsAny<Usuario>(), default))
            .Callback<Usuario, CancellationToken>((u, _) => capturedUser = u)
            .Returns(Task.CompletedTask);
        
        var plan = TestPlanFactory.Consultor();
        _planRepo.Setup(r => r.GetByNameAsync("Consultor", default)).ReturnsAsync(plan);

        var cmd = new GoogleLoginUserCommand("valid_token");
        var sut = CreateSut();

        var result = await sut.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Equal("jwt_token", result.Data!.Token);
        
        Assert.NotNull(capturedUser);
        Assert.True(capturedUser!.EmailVerificado);
        Assert.True(capturedUser.SocialLogin);
        Assert.Equal("123", capturedUser.GoogleId);
        Assert.Null(capturedUser.Cedula);
        Assert.Null(capturedUser.Rnc);
    }

    [Fact]
    public async Task Handle_ValidToken_ExistingUser_LinksAccountAndReturnsSession()
    {
        var profile = new GoogleUserProfile { Sub = "123", Email = "existing@test.com", Name = "Existing", EmailVerified = true };
        _googleAuth.Setup(g => g.VerifyTokenAsync("valid_token", default)).ReturnsAsync(profile);

        var existingUser = new Usuario("Existing", "User", "existing@test.com", "hash", UserRole.User, "8090000000", "00100000000");
        _usuarioRepo.Setup(r => r.GetByEmailAsync("existing@test.com", default)).ReturnsAsync(existingUser);
        _jwtGen.Setup(j => j.GenerateToken(It.IsAny<Usuario>(), It.IsAny<bool>())).Returns("jwt_token");

        var cmd = new GoogleLoginUserCommand("valid_token");
        var sut = CreateSut();

        var result = await sut.Handle(cmd, default);

        Assert.True(result.IsSuccess);
        Assert.True(existingUser.SocialLogin);
        Assert.Equal("123", existingUser.GoogleId);
        
        // Ensure we don't try to add a new user
        _usuarioRepo.Verify(r => r.AddAsync(It.IsAny<Usuario>(), default), Times.Never);
    }
}

