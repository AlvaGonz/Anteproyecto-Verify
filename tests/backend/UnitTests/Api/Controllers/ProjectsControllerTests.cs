using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Abstractions.Persistence;
using Application.Contracts.Projects;
using Application.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace UnitTests.Api.Controllers
{
    public class ProjectsControllerTests
    {
        private readonly Mock<IProjectService> _mockProjectService;
        private readonly Mock<IUsuarioRepository> _mockUsuarioRepository;
        private readonly ProjectsController _controller;

        public ProjectsControllerTests()
        {
            _mockProjectService = new Mock<IProjectService>();
            _mockUsuarioRepository = new Mock<IUsuarioRepository>();

            _controller = new ProjectsController(_mockProjectService.Object, _mockUsuarioRepository.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext()
                }
            };
        }

        private ProyectoDto CreateProyectoDto(Guid id, Guid usuarioCreadorId)
        {
            return new ProyectoDto(
                id,
                "CODE",
                "Name",
                "Ubicacion",
                null,
                null,
                null,
                ProjectCategory.Residencial,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                EstadoJuridico.Pendiente,
                null,
                null,
                "Borrador",
                ProjectStatus.Draft,
                IntegrityStatus.Valid,
                usuarioCreadorId,
                DateTime.UtcNow,
                null,
                null
            );
        }

        private Usuario CreateUsuario(Guid id, UserRole role)
        {
            var user = new Usuario("Test", "User", "test@test.com", "hash", role, "123", "123");
            typeof(EntityBase).GetProperty("Id")?.SetValue(user, id);
            return user;
        }

        [Fact]
        public async Task GetProjects_WhenUserIsDeveloper_ReturnsOnlyDeveloperProjects()
        {
            // Arrange
            var developerId = Guid.NewGuid();
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, developerId.ToString()),
                new Claim(ClaimTypes.Role, UserRole.User.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext.HttpContext.User = claimsPrincipal;

            var allProjects = new List<ProyectoDto>
            {
                CreateProyectoDto(Guid.NewGuid(), developerId),
                CreateProyectoDto(Guid.NewGuid(), Guid.NewGuid()), // Other user's project
                CreateProyectoDto(Guid.NewGuid(), developerId)
            };

            _mockProjectService
                .Setup(s => s.GetAllProjectsAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(allProjects);

            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(developerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(CreateUsuario(developerId, UserRole.User));

            // Act
            var result = await _controller.GetProjects(CancellationToken.None);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedProjects = Assert.IsAssignableFrom<IEnumerable<ProyectoDto>>(okResult.Value);
            
            Assert.Equal(2, returnedProjects.Count());
            Assert.All(returnedProjects, p => Assert.Equal(developerId, p.UsuarioCreadorId));
        }
    }
}
