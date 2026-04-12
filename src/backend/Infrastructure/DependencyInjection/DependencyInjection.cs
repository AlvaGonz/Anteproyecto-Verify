namespace Infrastructure.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Infrastructure.Configuration;
using Application.Abstractions.Storage;
using Infrastructure.Storage;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        services.Configure<AzureSqlOptions>(configuration.GetSection("AzureSql"));
        services.Configure<AzureBlobOptions>(configuration.GetSection("AzureBlob"));

        var useMock = configuration.GetValue<bool>("UseMockData");
        if (useMock)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("VeriFincaMockDb"));
        }
        else
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
        }

        services.AddScoped<IBlobStorageService, AzureBlobStorageService>();

        services.AddScoped<Application.Abstractions.Persistence.IProyectoRepository, Infrastructure.Persistence.Repositories.ProyectoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IDocumentoRepository, Infrastructure.Persistence.Repositories.DocumentoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IUsuarioRepository, Infrastructure.Persistence.Repositories.UsuarioRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IValidacionRepository, Infrastructure.Persistence.Repositories.ValidacionRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IHallazgoRepository, Infrastructure.Persistence.Repositories.HallazgoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IAuditoriaRepository, Infrastructure.Persistence.Repositories.AuditoriaRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IReporteRepository, Infrastructure.Persistence.Repositories.ReporteRepository>();
        services.AddScoped<Application.Abstractions.Persistence.ICertificacionRepository, Infrastructure.Persistence.Repositories.CertificacionRepository>();
        services.AddScoped<Application.Abstractions.Persistence.INotificacionRepository, Infrastructure.Persistence.Repositories.NotificacionRepository>();
        
        // New Validation Repositories
        services.AddScoped<Application.Abstractions.Persistence.IAlertaValidacionRepository, Infrastructure.Persistence.Repositories.AlertaValidacionRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IValidacionDgiiRepository, Infrastructure.Persistence.Repositories.ValidacionDgiiRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IValidacionAyuntamientoRepository, Infrastructure.Persistence.Repositories.ValidacionAyuntamientoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IDeteccionDuplicidadRepository, Infrastructure.Persistence.Repositories.DeteccionDuplicidadRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IConsentimientoRepository, Infrastructure.Persistence.Repositories.ConsentimientoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IResultadoCrediticioRepository, Infrastructure.Persistence.Repositories.ResultadoCrediticioRepository>();
        services.AddScoped<Application.Abstractions.Persistence.ISelloIntegridadRepository, Infrastructure.Persistence.Repositories.SelloIntegridadRepository>();

        services.AddScoped<Application.Abstractions.Persistence.IUnitOfWork, Infrastructure.Persistence.Repositories.UnitOfWork>();

        // Document Intelligence
        services.AddScoped<Application.Abstractions.DocumentIntelligence.IDocumentValidationService, Infrastructure.DocumentIntelligence.MockDocumentValidationService>();

        // Integrations
        services.AddScoped<Application.Abstractions.Integrations.IDgriService, Infrastructure.Integrations.DgriMockService>();
        services.AddScoped<Application.Abstractions.Integrations.ICatastroService, Infrastructure.Integrations.CatastroMockService>();
        services.AddScoped<Application.Services.CatastroComparisonService>();

        // External Validation Mocks
        services.Configure<Infrastructure.ExternalValidation.Configuration.ExternalValidationOptions>(configuration.GetSection("ExternalValidation"));
        
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, Infrastructure.ExternalValidation.Mocks.MockDgriValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, Infrastructure.ExternalValidation.Mocks.MockCatastroValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, Infrastructure.ExternalValidation.Mocks.MockDgiiValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, Infrastructure.ExternalValidation.Mocks.MockMivhedValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, Infrastructure.ExternalValidation.Mocks.MockAyuntamientoValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, Infrastructure.ExternalValidation.Mocks.MockTstValidationProvider>();
        
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalProviderResolver, Infrastructure.ExternalValidation.ExternalProviderResolver>();

        // Orchestrator
        services.AddScoped<Application.Services.Validation.IProjectValidationOrchestrator, Application.Services.Validation.ProjectValidationOrchestrator>();

        // Validations
        services.AddScoped<Application.Features.Validations.Commands.InitiateDgriValidation.InitiateDgriValidationCommandHandler>();
        services.AddScoped<Application.Features.Validations.Commands.InitiateCatastroValidation.InitiateCatastroValidationCommandHandler>();
        services.AddScoped<Application.Features.Validation.Commands.ValidarTerritorio.ValidarTerritorioCommandHandler>();
        
        // Consentimiento
        services.AddScoped<Application.Features.Consentimiento.Commands.RegistrarConsentimiento.RegistrarConsentimientoCommandHandler>();
        services.AddScoped<Application.Features.Consentimiento.Queries.VerificarConsentimientoVigente.VerificarConsentimientoVigenteQueryHandler>();
        
        // Credit
        services.AddScoped<Application.Features.Credit.Commands.ConsultarCredito.ConsultarCreditoCommandHandler>();
        
        // Sello
        services.AddScoped<Application.Abstractions.Services.Crypto.IFirmaDigitalService, Infrastructure.Services.Crypto.MockFirmaDigitalService>();
        services.AddScoped<Application.Abstractions.Services.Crypto.IQrGeneratorService, Infrastructure.Services.Crypto.MockQrGeneratorService>();
        services.AddScoped<Application.Features.Sello.Commands.EmitirSello.EmitirSelloCommandHandler>();

        // Certifications
        services.AddSingleton<Application.Abstractions.Certifications.ICertificationCodeGenerator, Infrastructure.Certifications.CertificationCodeGenerator>();
        services.AddScoped<Application.Features.Certifications.Commands.IssueCertification.IssueCertificationCommandHandler>();
        services.AddScoped<Application.Features.Certifications.Queries.GetProjectCertification.GetProjectCertificationQueryHandler>();
        services.AddScoped<Application.Features.Certifications.Queries.GetCertificationByCode.GetCertificationByCodeQueryHandler>();

        // Public Verification
        services.AddScoped<Application.Features.PublicVerification.Queries.GetPublicProjectVerification.GetPublicProjectVerificationQueryHandler>();

        // Public Consultation
        services.AddScoped<Application.Features.PublicConsulta.Queries.GetPublicProjectStatus.GetPublicProjectStatusQueryHandler>();

        // Reports & Audit
        services.AddScoped<Application.Abstractions.Reports.IReporteBuilder, Infrastructure.Services.Reports.ReporteBuilderService>();
        services.AddScoped<Application.Abstractions.Reports.IReportGenerator, Infrastructure.Reports.ReportGeneratorService>();
        services.AddScoped<Application.Abstractions.IAuditLogger, Infrastructure.Services.AuditoriaService>();
        services.AddScoped<Application.Features.Auditoria.Commands.AppendAuditEntry.AppendAuditEntryCommandHandler>();
        services.AddScoped<Application.Features.Reportes.Commands.GeneratePdfReport.GeneratePdfReportCommandHandler>();
        services.AddScoped<Application.Features.Reportes.Commands.GenerateExcelReport.GenerateExcelReportCommandHandler>();
        services.AddScoped<Application.Features.Reports.Queries.GenerarReporteHallazgos.GenerarReporteHallazgosQueryHandler>();
        services.AddScoped<Application.Features.Reports.Queries.GetPublicProjectReport.GetPublicProjectReportQueryHandler>();
        services.AddScoped<Application.Features.Reports.Queries.GetProjectReports.GetProjectReportsQueryHandler>();
        services.AddScoped<Application.Features.Audit.Queries.GetProjectAuditTrail.GetProjectAuditTrailQueryHandler>();
        services.AddScoped<Application.Features.Audit.Queries.ExportAuditTrail.ExportAuditTrailQueryHandler>();

        // Notifications
        services.AddScoped<Application.Abstractions.Notifications.IEmailService, Infrastructure.Services.MockEmailService>();
        services.AddScoped<Application.Abstractions.Notifications.IEmailNotificationService, Infrastructure.Services.EmailNotificationService>();

        // External Services
        services.AddScoped<Application.Abstractions.ExternalServices.IDgiiValidationService, Infrastructure.Services.DgiiValidationService>();
        services.AddScoped<Application.Abstractions.ExternalServices.IAyuntamientoService, Infrastructure.Services.AyuntamientoService>();
        
        services.Configure<Infrastructure.ExternalServices.Catastro.CatastroGeoOptions>(configuration.GetSection(Infrastructure.ExternalServices.Catastro.CatastroGeoOptions.SectionName));
        services.AddScoped<Application.Abstractions.Geo.ICatastroGeoService, Infrastructure.ExternalServices.Catastro.CatastroGeoServiceMock>();
        
        services.Configure<Infrastructure.ExternalServices.Credit.TransUnionOptions>(configuration.GetSection(Infrastructure.ExternalServices.Credit.TransUnionOptions.SectionName));
        services.AddScoped<Application.Abstractions.ExternalServices.Credit.ITransUnionService, Infrastructure.ExternalServices.Credit.TransUnionServiceMock>();

        // Validation Rules
        services.AddScoped<Application.Abstractions.Persistence.IReglaValidacionRepository, Infrastructure.Persistence.Repositories.ReglaValidacionRepository>();
        services.AddScoped<Application.Features.ReglasValidacion.Commands.CreateRule.CreateRuleCommandHandler>();
        services.AddScoped<Application.Features.ReglasValidacion.Commands.ToggleRuleStatus.ToggleRuleStatusCommandHandler>();
        services.AddScoped<Application.Features.ReglasValidacion.Queries.GetValidationRules.GetValidationRulesQueryHandler>();

        // End of Infrastructure

        return services;
    }
}
