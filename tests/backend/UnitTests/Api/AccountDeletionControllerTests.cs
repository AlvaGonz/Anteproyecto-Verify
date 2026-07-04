using Api.Controllers;
using Tests.Shared;
using Application.Abstractions;
using Application.Abstractions.Persistence;
using Application.Abstractions.Security;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace UnitTests.Api;

public class AccountDeletionControllerTests
{
    private readonly Mock<AppDbContext> _contextMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IUsuarioRepository> _usuarioRepoMock;
    private readonly Mock<IStripeService> _stripeServiceMock;
    private readonly Mock<IAuditLogger> _auditLoggerMock;
    private readonly AccountController _controller;

    public AccountDeletionControllerTests()
    {
        _contextMock = new Mock<AppDbContext>(new DbContextOptions<AppDbContext>());
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _usuarioRepoMock = new Mock<IUsuarioRepository>();
        _stripeServiceMock = new Mock<IStripeService>();
        _auditLoggerMock = new Mock<IAuditLogger>();

        _controller = new AccountController(
            _contextMock.Object,
            _passwordHasherMock.Object,
            _usuarioRepoMock.Object,
            _stripeServiceMock.Object,
            _auditLoggerMock.Object);

        var httpContext = new DefaultHttpContext();
        httpContext.User = new System.Security.Claims.ClaimsPrincipal(
            new System.Security.Claims.ClaimsIdentity(
                new[] { new System.Security.Claims.Claim(
                    System.Security.Claims.ClaimTypes.NameIdentifier,
                    Guid.NewGuid().ToString()) },
                "test"));
        _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
    }

    [Fact]
    public async Task RequestDeletion_ValidRequest_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        var user = TestUsuarioFactory.Create(UserRole.User);
        SetUserId(userId);
        _usuarioRepoMock.Setup(r => r.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.VerifyPassword("pass", user.ContrasenaHash))
            .Returns(true);

        var request = new DeleteAccountRequest("ELIMINAR", "pass", "Razon");
        var result = await _controller.RequestDeletion(request, default);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task RequestDeletion_WrongConfirmation_ReturnsBadRequest()
    {
        var request = new DeleteAccountRequest("NO", "pass", null);
        var result = await _controller.RequestDeletion(request, default);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task RequestDeletion_WrongPassword_ReturnsUnauthorized()
    {
        var userId = Guid.NewGuid();
        var user = TestUsuarioFactory.Create(UserRole.User);
        SetUserId(userId);
        _usuarioRepoMock.Setup(r => r.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.VerifyPassword("wrong", user.ContrasenaHash))
            .Returns(false);

        var request = new DeleteAccountRequest("ELIMINAR", "wrong", null);
        var result = await _controller.RequestDeletion(request, default);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task RequestDeletion_AlreadyPending_ReturnsBadRequest()
    {
        var userId = Guid.NewGuid();
        var user = TestUsuarioFactory.Create(UserRole.User);
        user.RequestDeletion("Ya");
        SetUserId(userId);
        _usuarioRepoMock.Setup(r => r.GetByIdAsync(userId, default))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(h => h.VerifyPassword("pass", user.ContrasenaHash))
            .Returns(true);

        var request = new DeleteAccountRequest("ELIMINAR", "pass", null);
        var result = await _controller.RequestDeletion(request, default);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    private void SetUserId(Guid id)
    {
        var identity = new System.Security.Claims.ClaimsIdentity(new[]
        {
            new System.Security.Claims.Claim(
                System.Security.Claims.ClaimTypes.NameIdentifier, id.ToString())
        }, "test");
        _controller.ControllerContext.HttpContext.User =
            new System.Security.Claims.ClaimsPrincipal(identity);
    }
}
