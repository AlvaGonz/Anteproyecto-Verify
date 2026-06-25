namespace Tests.Unit.Application;

using global::Application.Features.Consultas.Guards;
using global::Application.Abstractions.Persistence;
using global::Domain.Entities;
using global::Domain.Enums;
using Moq;
using Xunit;
using Tests.Shared;
using System.Threading;
using System.Threading.Tasks;
using System;

public class ConsultaSecurityTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IUnitOfWork> _uow = new();

    [Fact]
    public async Task ConsultaGuard_UserA_CannotConsumeUserBQuota()
    {
        // UserA makes a consultation
        // UserB's ConsultasUsadas must remain 0 after UserA's call
        // This verifies the guard uses the JWT userId, not a query param

        var userA = TestUsuarioFactory.Create(UserRole.User,
            TestPlanFactory.Profesional(), consultasUsadas: 0);
        var userB = TestUsuarioFactory.Create(UserRole.User,
            TestPlanFactory.Profesional(), consultasUsadas: 0);

        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(userA.Id, default))
            .ReturnsAsync(userA);
        // userB should NEVER be touched
        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(userB.Id, default))
            .ReturnsAsync(userB);

        var guard = new ConsultaQuotaGuard(_usuarioRepo.Object, _uow.Object);
        await guard.AssertAndIncrementAsync(userA.Id);

        // Verify userB's IncrementarConsulta was never called
        Assert.Equal(0, userB.ConsultasUsadas);
        Assert.Equal(1, userA.ConsultasUsadas);
    }

    [Fact]
    public async Task ConsultaGuard_NullUser_ThrowsUnauthorized()
    {
        _usuarioRepo.Setup(r => r.GetByIdWithPlanAsync(
            It.IsAny<Guid>(), default))
            .ReturnsAsync((Usuario?)null);

        var guard = new ConsultaQuotaGuard(_usuarioRepo.Object, _uow.Object);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => guard.AssertAndIncrementAsync(Guid.NewGuid()));
    }
}
