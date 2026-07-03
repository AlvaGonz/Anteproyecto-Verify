using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Features.Auth.Commands.UploadAvatar;
using Domain.Entities;
using Domain.Enums;
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
            Assert.False(result.IsSuccess);
            Assert.Contains("no encontrado", result.ErrorMessage);
        }

        [Fact]
        public async Task Handle_ShouldReturnError_WhenExtensionIsInvalid()
        {
            // Arrange
            var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.Professional, "123", "40200000000");
            _usuarioRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var command = new UploadAvatarCommand(user.Id, new MemoryStream(), "document.pdf", "application/pdf");

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Contains("Formato de imagen no permitido", result.ErrorMessage);
        }

        [Fact]
        public async Task Handle_ShouldSucceed_WhenImageIsValid()
        {
            // Arrange
            var user = new Usuario("Test", "User", "test@test.com", "hash", UserRole.Professional, "123", "40200000000");
            _usuarioRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var imageStream = CreateDummyImageStream();
            var command = new UploadAvatarCommand(user.Id, imageStream, "profile.jpg", "image/jpeg");

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.StartsWith("/avatars/", result.Data);
            Assert.EndsWith(".jpg", result.Data);

            Assert.Equal(result.Data, user.AvatarUrl);

            _usuarioRepositoryMock.Verify(x => x.Update(user), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);

            // Cleanup local file
            var avatarsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "storage", "avatars");
            var fileName = Path.GetFileName(result.Data!);
            var filePath = Path.Combine(avatarsDirectory, fileName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }
}
