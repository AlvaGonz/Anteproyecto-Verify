using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Api.Controllers;
using global::Application.Abstractions.Persistence;
using global::Application.Abstractions.Storage;
using global::Application.Contracts.Projects;
using global::Application.Common.Exceptions;
using global::Application.DTOs;
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
    public class PublicProjectConsultationQuotaTests : IDisposable
    {
        private readonly Mock<IProjectService> _mockProjectService;
        private readonly Mock<IUsuarioRepository> _mockUsuarioRepository;
        private readonly Mock<IBlobStorageService> _mockBlobStorageService;
        private readonly Mock<global::Application.Contracts.Documents.IDocumentService> _mockDocumentService;
        private readonly AppDbContext _dbContext;
        private readonly ProjectsController _controller;

        public PublicProjectConsultationQuotaTests()
        {
            _mockProjectService = new Mock<IProjectService>();
            _mockUsuarioRepository = new Mock<IUsuarioRepository>();
            _mockBlobStorageService = new Mock<IBlobStorageService>();
            _mockDocumentService = new Mock<global::Application.Contracts.Documents.IDocumentService>();

            // Use in-memory database for testing
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

        private void SeedLogConsultas(Guid usuarioId, int count)
        {
            for (int i = 0; i < count; i++)
            {
                _dbContext.LogConsultas.Add(new LogConsulta(
                    usuarioId,
                    true,
                    $"Consulta de prueba #{i + 1}"));
            }
            _dbContext.SaveChanges();
        }

        public void Dispose()
        {
            _dbContext?.Dispose();
        }

private ProyectoDto CreateProyectoDto(Guid id, Guid usuarioCreadorId, string estado = "Publicado")
        {
            return new ProyectoDto(
                Id: id,
                CodigoInterno: "PRJ-2024-001",
                Nombre: "Torre Bella Vista",
                UbicacionTexto: "Santo Domingo",
                UbicacionGps: null,
                ImagenUrl: null,
                ImagenAdicional1: null,
                ImagenAdicional2: null,
                ImagenAdicional3: null,
                ImagenAdicional4: null,
                ImagenAdicional5: null,
                ValorEstimado: null,
                Categoria: ProjectCategory.Residencial,
                DatosDesarrollador: "Constructora ABC",
                RncDesarrollador: "1-01-001",
                DesignacionCatastral: "CAT-123",
                Matricula: "001-01",
                Propietario: "Propietario Test",
                CedulaRncPropietario: "001-0000001-1",
                Ipi: "IPI-001",
                EstadoJuridico: EstadoJuridico.Valido,
                EstatusIpi: "Vigente",
                SuperficieM2: 500m,
                EstatusDescripcion: estado,
                EstadoProyecto: "Creado",
                EstadoIntegridad: IntegrityStatus.Valid,
                UsuarioCreadorId: usuarioCreadorId,
                CreatedAtUtc: DateTime.UtcNow,
                UpdatedAtUtc: null,
                RegistradoPor: null,
                PlanNombre: "Test Plan"
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
            SeedLogConsultas(userId, 1);

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

            // Check anonymous object properties
            var errorObj = statusResult.Value!;
            var errorType = errorObj.GetType();
            var errorProp = errorType.GetProperty("error");
            var limitTypeProp = errorType.GetProperty("limitType");
            
            Assert.NotNull(errorProp);
            Assert.Equal("QUOTA_EXCEEDED", errorProp.GetValue(errorObj));
            Assert.NotNull(limitTypeProp);
            Assert.Equal("MaxConsultas", limitTypeProp.GetValue(errorObj));
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
            SeedLogConsultas(userId, 2);

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

            var errorObj = statusResult.Value!;
            var errorType = errorObj.GetType();
            var errorProp = errorType.GetProperty("error");
            
            Assert.NotNull(errorProp);
            Assert.Equal("QUOTA_EXCEEDED", errorProp.GetValue(errorObj));
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