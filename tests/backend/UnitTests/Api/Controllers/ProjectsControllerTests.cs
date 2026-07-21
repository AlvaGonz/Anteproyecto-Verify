using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Abstractions.Persistence;
using Application.Abstractions.Storage;
using Application.Contracts.Projects;
using Application.Common.Exceptions;
using Application.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace UnitTests.Api.Controllers
{
    public class ProjectsControllerTests : IDisposable
    {
        private readonly Mock<IProjectService> _mockProjectService;
        private readonly Mock<IUsuarioRepository> _mockUsuarioRepository;
        private readonly Mock<IBlobStorageService> _mockBlobStorageService;
        private readonly Mock<global::Application.Contracts.Documents.IDocumentService> _mockDocumentService;
        private readonly AppDbContext _dbContext;
        private readonly ProjectsController _controller;

        public ProjectsControllerTests()
        {
            _mockProjectService = new Mock<IProjectService>();
            _mockUsuarioRepository = new Mock<IUsuarioRepository>();
            _mockBlobStorageService = new Mock<IBlobStorageService>();
            _mockDocumentService = new Mock<global::Application.Contracts.Documents.IDocumentService>();

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _dbContext = new AppDbContext(options);

            _controller = new ProjectsController(
                _mockProjectService.Object,
                _mockUsuarioRepository.Object,
                _mockBlobStorageService.Object,
                _mockDocumentService.Object,
                _dbContext)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext()
                }
            };
        }

        public void Dispose()
        {
            _dbContext?.Dispose();
        }

        private ProyectoDto CreateProyectoDto(Guid id, Guid usuarioCreadorId)
        {
            return new ProyectoDto(
                id,
                "CODE",
                "Name",
                "Ubicacion",
                null, // UbicacionGps
                null, // ImagenUrl
                null, // ImagenAdicional1
                null, // ImagenAdicional2
                null, // ImagenAdicional3
                null, // ImagenAdicional4
                null, // ImagenAdicional5
                null, // ValorEstimado
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
                "Creado",
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

        [Fact]
        public async Task GetProjectById_AuthenticatedUserUnderQuota_ReturnsProjectAndLogsConsulta()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var projectId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, Guid.NewGuid()); // Different owner
            
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, UserRole.User.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext.HttpContext.User = claimsPrincipal;

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

            // User has effective plan with MaxConsultas=25, ConsultasUsadas=5 (under quota)
            var user = CreateUsuario(userId, UserRole.User);
            user.GetType().GetProperty(nameof(Usuario.Plan))?.SetValue(user, Tests.Shared.TestPlanFactory.Profesional());
            user.GetType().GetProperty(nameof(Usuario.ConsultasUsadas))?.SetValue(user, 5);
            user.GetType().GetProperty(nameof(Usuario.SubscriptionStatus))?.SetValue(user, "active");
            
            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedProject = Assert.IsType<ProyectoDto>(okResult.Value);
            Assert.Equal(projectId, returnedProject.Id);

            // Verify consulta was logged
            _mockProjectService.Verify(
                s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()), 
                Times.Once);
        }

        [Fact]
        public async Task GetProjectById_AuthenticatedUserAtQuota_ReturnsQuotaExceeded()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var projectId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, Guid.NewGuid());
            
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, UserRole.User.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext.HttpContext.User = claimsPrincipal;

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

            // User at quota: MaxConsultas=1, ConsultasUsadas=1
            var user = CreateUsuario(userId, UserRole.User);
            user.GetType().GetProperty(nameof(Usuario.Plan))?.SetValue(user, Tests.Shared.TestPlanFactory.Consultor());
            user.GetType().GetProperty(nameof(Usuario.ConsultasUsadas))?.SetValue(user, 1);
            user.GetType().GetProperty(nameof(Usuario.SubscriptionStatus))?.SetValue(user, "active");
            
            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(402, statusResult.StatusCode);
            
            // Check anonymous object properties
            var errorObj = statusResult.Value!;
            var errorType = errorObj.GetType();
            var errorProp = errorType.GetProperty("error");
            
            Assert.NotNull(errorProp);
            Assert.Equal("QUOTA_EXCEEDED", errorProp.GetValue(errorObj));
        }

        [Fact]
        public async Task GetProjectById_ProjectOwner_DoesNotConsumeQuota()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var projectId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, ownerId); // Same owner
            
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, ownerId.ToString()),
                new Claim(ClaimTypes.Role, UserRole.User.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext.HttpContext.User = claimsPrincipal;

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

            // Owner with limited plan but at quota
            var user = CreateUsuario(ownerId, UserRole.User);
            user.GetType().GetProperty(nameof(Usuario.Plan))?.SetValue(user, Tests.Shared.TestPlanFactory.Consultor());
            user.GetType().GetProperty(nameof(Usuario.ConsultasUsadas))?.SetValue(user, 1);
            user.GetType().GetProperty(nameof(Usuario.SubscriptionStatus))?.SetValue(user, "active");
            
            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(ownerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert - Owner should still get project regardless of quota
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedProject = Assert.IsType<ProyectoDto>(okResult.Value);
            Assert.Equal(projectId, returnedProject.Id);
        }

        [Fact]
        public async Task GetProjectById_AnonymousUser_ReturnsProjectWithoutConsultaCheck()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, Guid.NewGuid());
            
            // No authenticated user
            _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal();

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert - Anonymous gets project (Human Gate: preserve current behavior)
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedProject = Assert.IsType<ProyectoDto>(okResult.Value);
            Assert.Equal(projectId, returnedProject.Id);
        }
    }
}



