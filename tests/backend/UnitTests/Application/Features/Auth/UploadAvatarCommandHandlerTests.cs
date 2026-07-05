using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Features.Auth.Commands.UploadAvatar;
using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Moq;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using Xunit;

namespace UnitTests.Application.Features.Auth
{
    public class UploadAvatarCommandHandlerTests
    {
        private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly UploadAvatarCommandHandler _handler;

        public UploadAvatarCommandHandlerTests()
        {
            _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _handler = new UploadAvatarCommandHandler(_usuarioRepositoryMock.Object, _unitOfWorkMock.Object);
        }

        private MemoryStream CreateDummyImageStream()
        {
            var stream = new MemoryStream();
            using (var image = new Image<Rgba32>(10, 10))
            {
                image.SaveAsJpeg(stream);
            }
            stream.Position = 0;
            return stream;
        }

        [Fact]
        public async Task Handle_ShouldReturnError_WhenUserNotFound()
        {
            // Arrange
            _usuarioRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Usuario?)null);

            var command = new UploadAvatarCommand(Guid.NewGuid(), new MemoryStream(), "avatar.png", "image/png");

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Contain("no encontrado");
        }

        [Fact]
        public async Task Handle_ShouldReturnError_WhenExtensionIsInvalid()
        {
            // Arrange
            var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123", "402-0000000-1");
            _usuarioRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var command = new UploadAvatarCommand(user.Id, new MemoryStream(), "document.pdf", "application/pdf");

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Contain("Formato de imagen no permitido");
        }

        [Fact]
        public async Task Handle_ShouldSucceed_WhenImageIsValid()
        {
            // Arrange
            var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.User, "123", "402-0000000-1");
            _usuarioRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var imageStream = CreateDummyImageStream();
            var command = new UploadAvatarCommand(user.Id, imageStream, "profile.jpg", "image/jpeg");

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().StartWith("data:image/jpeg;base64,");

            user.AvatarUrl.Should().Be(result.Data);

            _usuarioRepositoryMock.Verify(x => x.Update(user), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
