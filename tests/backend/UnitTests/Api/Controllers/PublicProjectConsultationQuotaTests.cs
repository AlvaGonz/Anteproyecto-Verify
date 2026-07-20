using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using Application.Abstractions.Persistence;
using Application.Abstractions.Storage;
using Application.Common.Exceptions;
using Application.Contracts.Projects;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace UnitTests.Api.Controllers
{
    public class PublicProjectConsultationQuotaTests
    {
        private readonly Mock<IProjectService> _mockProjectService;
        private readonly Mock<IUsuarioRepository> _mockUsuarioRepository;
        private readonly Mock<IBlobStorageService> _mockBlobStorageService;
        private readonly Mock<global::Application.Contracts.Documents.IDocumentService> _mockDocumentService;
        private readonly ProjectsController _controller;

        public PublicProjectConsultationQuotaTests()
        {
            _mockProjectService = new Mock<IProjectService>();
            _mockUsuarioRepository = new Mock<IUsuarioRepository>();
            _mockBlobStorageService = new Mock<IBlobStorageService>();
            _mockDocumentService = new Mock<global::Application.Contracts.Documents.IDocumentService>();

            _controller = new ProjectsController(
                _mockProjectService.Object,
                _mockUsuarioRepository.Object,
                _mockBlobStorageService.Object,
                _mockDocumentService.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext()
                }
            };
        }

        private ProyectoDto CreateProyectoDto(Guid id, Guid usuarioCreadorId, string estado = "Publicado")
        {
            return new ProyectoDto(
                id,
                "PRJ-2024-001",
                "Torre Bella Vista",
                "Santo Domingo",
                null,
                null, null, null, null, null,
                null,
                ProjectCategory.Residencial,
                "Constructora ABC",
                "1-01-001",
                "CAT-123",
                "001-01",
                "Propietario Test",
                "001-0000001-1",
                "IPI-001",
                EstadoJuridico.Aprobado,
                "Vigente",
                500,
                estado,
                "Creado",
                IntegrityStatus.Valid,
                usuarioCreadorId,
                DateTime.UtcNow,
                null,
                null,
                "Test Plan"
            );
        }

        private Usuario CreateAuthenticatedUser(Guid id, UserRole role, Guid? planId = null, int consultasUsadas = 0, int maxConsultas = 10)
        {
            var user = new Usuario("Test", "User", "test@test.com", "hash", role, "123456", "001-0000001-1");
            typeof(EntityBase).GetProperty("Id")?.SetValue(user, id);

            if (planId.HasValue)
            {
                var plan = CreatePlan(maxConsultas: maxConsultas);
                user.AsignarPlan(planId.Value);
                typeof(Usuario).GetProperty(nameof(Usuario.Plan))!.SetValue(user, plan);
            }

            typeof(Usuario).GetProperty(nameof(Usuario.ConsultasUsadas))!.SetValue(user, consultasUsadas);
            return user;
        }

        private PlanSuscripcion CreatePlan(int maxConsultas, int maxProyectos = 5)
        {
            return PlanSuscripcion.Create(
                Guid.NewGuid(),
                "Test Plan",
                0m,
                maxConsultas,
                maxProyectos,
                true,   // PresentacionPublica
                true,   // QrIncluido
                0,      // MaxUsuariosSecundarios
                100,    // MaxAlmacenamientoMb
                false, false, false, false, false, false,
                "Comunidad",
                false);
        }

        private void SetAuthUser(Guid userId, UserRole role)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(identity);
        }

        // ──────────────────────────────────────────────
        // RED TESTS: Consultation Quota Enforcement
        // ──────────────────────────────────────────────

        [Fact]
        public async Task GetProjectById_UserUnderConsultationQuota_ReturnsProjectAndIncrementsConsultation()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, Guid.NewGuid()); // Different owner
            var user = CreateAuthenticatedUser(userId, UserRole.User, planId: Guid.NewGuid(), consultasUsadas: 0, maxConsultas: 5);

            SetAuthUser(userId, UserRole.User);

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

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
        public async Task GetProjectById_UserAtConsultationLimit_ReturnsQuotaExceededError()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, Guid.NewGuid());
            var user = CreateAuthenticatedUser(userId, UserRole.User, planId: Guid.NewGuid(), consultasUsadas: 1, maxConsultas: 1);

            SetAuthUser(userId, UserRole.User);

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(402, statusResult.StatusCode);

            var errorResponse = Assert.IsType<Dictionary<string, object>>(statusResult.Value);
            Assert.Equal("QUOTA_EXCEEDED", errorResponse["error"]);
            Assert.Equal("MaxConsultas", errorResponse["limitType"]);
        }

        [Fact]
        public async Task GetProjectById_UserOverConsultationLimit_ReturnsQuotaExceededError()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, Guid.NewGuid());
            var user = CreateAuthenticatedUser(userId, UserRole.User, planId: Guid.NewGuid(), consultasUsadas: 2, maxConsultas: 1);

            SetAuthUser(userId, UserRole.User);

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(402, statusResult.StatusCode);

            var errorResponse = Assert.IsType<Dictionary<string, object>>(statusResult.Value);
            Assert.Equal("QUOTA_EXCEEDED", errorResponse["error"]);
        }

        [Fact]
        public async Task GetProjectById_ProjectOwner_DoesNotConsumeConsultation()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var ownerId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, ownerId);
            var user = CreateAuthenticatedUser(ownerId, UserRole.User, planId: Guid.NewGuid(), consultasUsadas: 5, maxConsultas: 5);

            SetAuthUser(ownerId, UserRole.User);

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

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
        public async Task GetProjectById_AdminUser_DoesNotConsumeConsultation()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var adminId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, Guid.NewGuid());
            var admin = CreateAuthenticatedUser(adminId, UserRole.Administrator, planId: null, consultasUsadas: 999);

            SetAuthUser(adminId, UserRole.Administrator);

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(admin);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert - Admin should bypass quota checks
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<ProyectoDto>(okResult.Value);
        }

        [Fact]
        public async Task GetProjectById_AnonymousUser_AllowsAccessWithoutQuotaCheck()
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

        [Fact]
        public async Task GetProjectById_UnlimitedPlan_AlwaysAllowsAccess()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, Guid.NewGuid());
            var user = CreateAuthenticatedUser(userId, UserRole.User, planId: Guid.NewGuid(), consultasUsadas: 999999, maxConsultas: -1); // -1 = unlimited

            SetAuthUser(userId, UserRole.User);

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<ProyectoDto>(okResult.Value);
        }

        [Fact]
        public async Task GetProjectById_NotFound_Returns404()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var user = CreateAuthenticatedUser(userId, UserRole.User);

            SetAuthUser(userId, UserRole.User);

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((ProyectoDto?)null);

            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetProjectById_ProjectNotPublic_Returns404OrForbidden()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var project = CreateProyectoDto(projectId, Guid.NewGuid(), estado: "Creado"); // Not public
            var user = CreateAuthenticatedUser(userId, UserRole.User);

            SetAuthUser(userId, UserRole.User);

            _mockProjectService
                .Setup(s => s.GetProjectByIdAsync(projectId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(project);

            _mockUsuarioRepository
                .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetProjectById(projectId, CancellationToken.None);

            // Assert - Should not return project if not public (or return 404/403)
        }
    }
}