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

            var command = new UploadAvatarCommand(Guid.NewGuid(), "avatar.png", new MemoryStream());

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("no encontrado", result.ErrorMessage);
        }

        [Fact]
        public async Task Handle_ShouldReturnError_WhenExtensionIsInvalid()
        {
            // Arrange
            var user = new Usuario("test@test.com", "hash", "Test", "User", "123", UserRole.Professional, PlanType.Professional);
            _usuarioRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var command = new UploadAvatarCommand(user.Id, "document.pdf", new MemoryStream());

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("Formato de imagen no permitido", result.ErrorMessage);
        }

        [Fact]
        public async Task Handle_ShouldSucceed_WhenImageIsValid()
        {
            // Arrange
            var user = new Usuario("test@test.com", "hash", "Test", "User", "123", UserRole.Professional, PlanType.Professional);
            _usuarioRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            var imageStream = CreateDummyImageStream();
            var command = new UploadAvatarCommand(user.Id, "profile.jpg", imageStream);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result.Success);
            Assert.StartsWith("/avatars/", result.AvatarUrl);
            Assert.EndsWith(".jpg", result.AvatarUrl);

            Assert.Equal(result.AvatarUrl, user.AvatarUrl);

            _usuarioRepositoryMock.Verify(x => x.Update(user), Times.Once);
            _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);

            // Cleanup local file
            var avatarsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "storage", "avatars");
            var fileName = Path.GetFileName(result.AvatarUrl);
            var filePath = Path.Combine(avatarsDirectory, fileName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }
}
