namespace Application.DependencyInjection;

using Microsoft.Extensions.DependencyInjection;
using FluentValidation;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register MediatR, FluentValidation, AutoMapper, etc.
        services.AddScoped<Application.Contracts.Projects.IProjectService, Application.Features.Projects.ProjectService>();
        services.AddScoped<Application.Contracts.Documents.IDocumentService, Application.Features.Documents.DocumentService>();

        // Validation Engine
        services.AddValidatorsFromAssembly(System.Reflection.Assembly.GetExecutingAssembly());
        services.AddScoped<Application.Abstractions.Validation.IInternalValidationEngine, Application.Services.Validation.InternalValidationEngine>();
        services.AddScoped<Application.Abstractions.Validation.IValidationRule, Application.Services.Validation.Rules.RequiredDocuments.RequiredDocumentsRule>();
        services.AddScoped<Application.Abstractions.Validation.IValidationRule, Application.Services.Validation.Rules.RequiredMetadata.RequiredMetadataRule>();
        services.AddScoped<Application.Abstractions.Validation.IValidationRule, Application.Services.Validation.Rules.Validity.ValidityRule>();
        services.AddScoped<Application.Abstractions.Validation.IValidationRule, Application.Services.Validation.Rules.Consistency.ConsistencyRule>();

        // Validation Handlers
        services.AddScoped<Application.Handlers.Admin.GetDashboardStatsQueryHandler>();
        services.AddScoped<Application.Features.Validation.Commands.ExecuteDgiiValidation.ExecuteDgiiValidationCommandHandler>();
        services.AddScoped<Application.Features.Validation.Commands.ExecuteAyuntamientoValidation.ExecuteAyuntamientoValidationCommandHandler>();
        services.AddScoped<Application.Features.Validation.Commands.CheckDuplicateExpediente.CheckDuplicateExpedienteCommandHandler>();
        services.AddScoped<Application.Features.Validation.Commands.EvaluateDocumentFormality.EvaluateDocumentFormalityCommandHandler>();
        services.AddScoped<Application.Features.Validation.Commands.GenerateAlerta.GenerateAlertaCommandHandler>();
        services.AddScoped<Application.Features.Validation.Queries.GetActiveAlertsByProject.GetActiveAlertsByProjectQueryHandler>();
        services.AddScoped<Application.Features.Auth.Commands.RegisterUser.RegisterUserCommandHandler>();
        services.AddScoped<Application.Features.Auth.Commands.LoginUser.LoginUserCommandHandler>();
        services.AddScoped<Application.Features.Auth.Commands.VerifyEmail.VerifyEmailCommandHandler>();
        services.AddScoped<Application.Features.Auth.Commands.UpdateProfile.UpdateProfileCommandHandler>();
        services.AddScoped<Application.Features.Auth.Commands.UploadAvatar.UploadAvatarCommandHandler>();

        return services;
    }
}
