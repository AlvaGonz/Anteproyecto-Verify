namespace Tests.Unit.Application;

using System;
using System.Threading;
using System.Threading.Tasks;
using global::Application.Abstractions.Persistence;
using global::Application.Features.Auth.Commands.UpdatePublicPreferences;
using global::Domain.Enums;
using Moq;
using Tests.Shared;
using Xunit;

public class UpdatePublicPreferencesCommandHandlerTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IUnitOfWork> _uow = new();

    private UpdatePublicPreferencesCommandHandler CreateSut() =>
        new(_usuarioRepo.Object, _uow.Object);

    [Theory]
    [InlineData(null, null)]
    [InlineData((NombrePublicoModo)0, (IdentificacionPublicaModo)0)]
    [InlineData(NombrePublicoModo.RealName, (IdentificacionPublicaModo)0)]
    [InlineData((NombrePublicoModo)0, IdentificacionPublicaModo.Cedula)]
    public async Task Handle_SinOpcionElegida_Rechaza(NombrePublicoModo? nombreModo, IdentificacionPublicaModo? identificacionModo)
    {
        var result = await CreateSut().Handle(
            new UpdatePublicPreferencesCommand(Guid.NewGuid(), nombreModo, identificacionModo),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        _usuarioRepo.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_OpcionesValidas_PersisteEnElUsuario()
    {
        var userId = Guid.NewGuid();
        var user = TestUsuarioFactory.Create(UserRole.User);
        _usuarioRepo.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var result = await CreateSut().Handle(
            new UpdatePublicPreferencesCommand(
                userId,
                NombrePublicoModo.RealName | NombrePublicoModo.Nickname,
                IdentificacionPublicaModo.Cedula | IdentificacionPublicaModo.Rnc),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(NombrePublicoModo.RealName | NombrePublicoModo.Nickname, user.NombrePublicoModo);
        Assert.Equal(IdentificacionPublicaModo.Cedula | IdentificacionPublicaModo.Rnc, user.IdentificacionPublicaModo);
        _uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
