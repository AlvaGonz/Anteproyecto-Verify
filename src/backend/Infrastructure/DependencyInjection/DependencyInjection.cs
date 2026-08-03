namespace Infrastructure.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.DataProtection;
using Resend;
using Configuration;
using Application.Abstractions;
using Application.Abstractions.Storage;
using Application.Contracts.Geo;
using Application.Documents.Extractions;
using Storage;
using Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        services.Configure<AzureSqlOptions>(configuration.GetSection("AzureSql"));
        services.Configure<AzureBlobOptions>(configuration.GetSection("AzureBlob"));

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IBlobStorageService, AzureBlobStorageService>();
        services.AddHttpClient<Application.Abstractions.Ocr.IOcrProvider, Ocr.PaddleOcrProvider>();

        services.AddScoped<Application.Abstractions.Persistence.IProyectoRepository, Persistence.Repositories.ProyectoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IDocumentoRepository, Persistence.Repositories.DocumentoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IUsuarioRepository, Persistence.Repositories.UsuarioRepository>();
        services.AddScoped<Application.Features.Subscriptions.Queries.GetMySubscriptionStatus.IUserSubscriptionReadRepository, Persistence.Repositories.UsuarioRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IPlanSuscripcionRepository, Persistence.Repositories.PlanSuscripcionRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IDashboardRepository, Persistence.Repositories.DashboardRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IValidacionRepository, Persistence.Repositories.ValidacionRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IHallazgoRepository, Persistence.Repositories.HallazgoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IAuditoriaRepository, Persistence.Repositories.AuditoriaRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IReporteRepository, Persistence.Repositories.ReporteRepository>();
        services.AddScoped<Application.Abstractions.Persistence.ICertificacionRepository, Persistence.Repositories.CertificacionRepository>();
        services.AddScoped<Application.Abstractions.Persistence.INotificacionRepository, Persistence.Repositories.NotificacionRepository>();
        
        // New Validation Repositories
        services.AddScoped<Application.Abstractions.Persistence.IAlertaValidacionRepository, Persistence.Repositories.AlertaValidacionRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IValidacionDgiiRepository, Persistence.Repositories.ValidacionDgiiRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IValidacionAyuntamientoRepository, Persistence.Repositories.ValidacionAyuntamientoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IDeteccionDuplicidadRepository, Persistence.Repositories.DeteccionDuplicidadRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IConsentimientoRepository, Persistence.Repositories.ConsentimientoRepository>();
        services.AddScoped<Application.Abstractions.Persistence.IResultadoCrediticioRepository, Persistence.Repositories.ResultadoCrediticioRepository>();
        services.AddScoped<Application.Abstractions.Persistence.ISelloIntegridadRepository, Persistence.Repositories.SelloIntegridadRepository>();
        services.AddScoped<Application.Contracts.Projects.ICatastroLookupRepository, Persistence.Repositories.CatastroLookupRepository>();

        services.AddScoped<Application.Abstractions.Persistence.IUnitOfWork, Persistence.Repositories.UnitOfWork>();

        // Document Intelligence
        services.AddScoped<Application.Abstractions.DocumentIntelligence.IDocumentValidationService, DocumentIntelligence.MockDocumentValidationService>();
        services.AddScoped<Application.Services.DocumentProcessing.FieldValidation.IDocumentFieldNormalizer, DocumentProcessing.DocumentFieldNormalizer>();
        services.AddScoped<Application.Services.DocumentProcessing.FieldValidation.IDocumentValidationRuleEngine, DocumentProcessing.DocumentValidationRuleEngine>();

        // Integrations
        services.AddScoped<Application.Abstractions.Integrations.IDgriService, Integrations.DgriMockService>();
        services.AddScoped<Application.Abstractions.Integrations.ICatastroService, Integrations.CatastroMockService>();
        services.AddScoped<Application.Services.CatastroComparisonService>();

        // External Validation Mocks
        services.Configure<ExternalValidation.Configuration.ExternalValidationOptions>(configuration.GetSection("ExternalValidation"));
        
        // Geo Resolution Service
        services.AddScoped<IGeoResolutionService, global::Infrastructure.Persistence.Services.GeoResolutionService>();
        
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, ExternalValidation.Mocks.MockDgriValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, ExternalValidation.Mocks.MockCatastroValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, ExternalValidation.Mocks.MockDgiiValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, ExternalValidation.Mocks.MockMivhedValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, ExternalValidation.Mocks.MockAyuntamientoValidationProvider>();
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalValidationProvider, ExternalValidation.Mocks.MockTstValidationProvider>();
        
        services.AddScoped<Application.Abstractions.ExternalValidation.IExternalProviderResolver, ExternalValidation.ExternalProviderResolver>();

        // Orchestrator
        services.AddScoped<Application.Services.Validation.IIntegrityScoringService, Application.Services.Validation.IntegrityScoringService>();
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
        services.AddScoped<Application.Features.Sello.Commands.EmitirSello.EmitirSelloCommandHandler>();

        // Certifications
        services.AddSingleton<Application.Abstractions.Certifications.ICertificationCodeGenerator, Certifications.CertificationCodeGenerator>();
        services.AddScoped<Application.Features.Certifications.Commands.IssueCertification.IssueCertificationCommandHandler>();
        services.AddScoped<Application.Features.Certifications.Queries.GetProjectCertification.GetProjectCertificationQueryHandler>();
        services.AddScoped<Application.Features.Certifications.Queries.GetCertificationByCode.GetCertificationByCodeQueryHandler>();

        // Public Verification
        services.AddScoped<Application.Features.PublicVerification.Queries.GetPublicProjectVerification.GetPublicProjectVerificationQueryHandler>();

        // Public Consultation
        services.AddScoped<Application.Features.PublicConsulta.Queries.GetPublicProjectStatus.GetPublicProjectStatusQueryHandler>();

        // Reports & Audit
        services.AddScoped<Application.Abstractions.Reports.IReporteBuilder, Services.Reports.ReporteBuilderService>();
        services.AddScoped<Application.Abstractions.Reports.IReportGenerator, Reports.ReportGeneratorService>();
        services.AddScoped<Application.Abstractions.IAuditLogger, Services.AuditoriaService>();
        services.AddScoped<Application.Features.Auditoria.Commands.AppendAuditEntry.AppendAuditEntryCommandHandler>();
        services.AddScoped<Application.Features.Reportes.Commands.GeneratePdfReport.GeneratePdfReportCommandHandler>();
        services.AddScoped<Application.Features.Reportes.Commands.GenerateExcelReport.GenerateExcelReportCommandHandler>();
        services.AddScoped<Application.Features.Reports.Queries.GenerarReporteHallazgos.GenerarReporteHallazgosQueryHandler>();
        services.AddScoped<Application.Features.Reports.Queries.GetPublicProjectReport.GetPublicProjectReportQueryHandler>();
        services.AddScoped<Application.Features.Reports.Queries.GetProjectReports.GetProjectReportsQueryHandler>();
        
        // Audit Queries
        services.AddScoped<Application.Features.Audit.Queries.GetProjectAuditTrail.GetProjectAuditTrailQueryHandler>();
        services.AddScoped<Application.Features.Audit.Queries.ExportAuditTrail.ExportAuditTrailQueryHandler>();
        services.AddScoped<Application.Features.Audit.Queries.GetGlobalAuditTrail.GetGlobalAuditTrailQueryHandler>();
        services.AddScoped<Application.Features.Audit.Queries.ExportGlobalAuditTrail.ExportGlobalAuditTrailQueryHandler>();

        // Notifications
        var resendToken = configuration.GetValue<string>("Resend:ApiToken") ?? "re_mock_token";
        services.AddResend(options =>
        {
            options.ApiToken = resendToken;
            options.ThrowExceptions = true;
        });
        services.AddScoped<Application.Abstractions.Notifications.IEmailService, Email.ResendEmailService>();
        services.AddScoped<Application.Abstractions.Notifications.IEmailNotificationService, Services.EmailNotificationService>();

        // External Services
        services.AddScoped<Application.Abstractions.ExternalServices.IDgiiValidationService, Services.DgiiValidationService>();
        services.AddScoped<Application.Abstractions.ExternalServices.IAyuntamientoService, Services.AyuntamientoService>();
        
        services.Configure<ExternalServices.Catastro.CatastroGeoOptions>(configuration.GetSection(ExternalServices.Catastro.CatastroGeoOptions.SectionName));
        services.AddScoped<Application.Abstractions.Geo.ICatastroGeoService, ExternalServices.Catastro.CatastroGeoServiceMock>();
        
        services.Configure<ExternalServices.Credit.TransUnionOptions>(configuration.GetSection(ExternalServices.Credit.TransUnionOptions.SectionName));
        services.AddScoped<Application.Abstractions.ExternalServices.Credit.ITransUnionService, ExternalServices.Credit.TransUnionServiceMock>();

        // Validation Rules
        services.AddScoped<Application.Abstractions.Persistence.IReglaValidacionRepository, Persistence.Repositories.ReglaValidacionRepository>();
        services.AddScoped<Application.Features.ReglasValidacion.Commands.CreateRule.CreateRuleCommandHandler>();
        services.AddScoped<Application.Features.ReglasValidacion.Commands.ToggleRuleStatus.ToggleRuleStatusCommandHandler>();
        services.AddScoped<Application.Features.ReglasValidacion.Queries.GetValidationRules.GetValidationRulesQueryHandler>();
        services.AddSingleton<Application.Abstractions.Security.IJwtTokenGenerator, Security.JwtTokenGenerator>();
        services.AddSingleton<Application.Abstractions.Security.IPasswordHasher, Security.BCryptPasswordHasher>();
        services.AddScoped<Application.Abstractions.Security.IGoogleAuthService, Security.GoogleAuthService>();

        // 2FA
        services.AddSingleton<Application.Abstractions.Security.ITotpService, Security.TotpService>();
        services.AddScoped<Application.Abstractions.Security.IRecoveryCodeService, Security.RecoveryCodeService>();
        services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(Path.GetTempPath(), "dpkeys-" + Guid.NewGuid().ToString("N"))));
        services.AddSingleton<Microsoft.AspNetCore.DataProtection.IDataProtector>(sp =>
            sp.GetRequiredService<Microsoft.AspNetCore.DataProtection.IDataProtectionProvider>()
              .CreateProtector("TwoFactorSecret"));
        services.AddScoped<Application.Abstractions.Security.ITwoFactorSecretProtector>(sp =>
            new Security.TwoFactorSecretProtector(sp.GetRequiredService<Microsoft.AspNetCore.DataProtection.IDataProtector>()));
        services.AddMemoryCache();
        services.AddSingleton<Application.Abstractions.Security.ITwoFactorChallengeStore, Security.InMemoryTwoFactorChallengeStore>();
        services.AddSingleton<global::Infrastructure.Services.ITwoFactorEmailEventLogger, global::Infrastructure.Services.TwoFactorEmailEventLogger>();
        services.AddScoped<global::Infrastructure.Services.EmailOtpService>();

        services.AddScoped<IStripeService, Services.StripeService>();
        services.AddScoped<Application.Contracts.Subscriptions.ISubscriptionService, Services.SubscriptionService>();

        // Account Deletion
        services.AddScoped<Application.Features.Account.Commands.RequestAccountDeletion.RequestAccountDeletionCommandHandler>();
        services.AddScoped<Application.Features.Account.Commands.RecoverAccount.RecoverAccountCommandHandler>();
        services.AddScoped<Application.Features.Account.Commands.PurgeAccounts.PurgeAccountsCommandHandler>();

        // Background Jobs
        services.AddHostedService<BackgroundJobs.MonthlyResetJob>();
        services.AddHostedService<BackgroundJobs.AccountPurgeJob>();

        // End of Infrastructure

        return services;
    }
}
