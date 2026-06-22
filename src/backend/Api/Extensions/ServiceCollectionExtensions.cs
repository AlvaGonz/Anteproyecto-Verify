namespace Api.Extensions;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.Tasks;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers();
        
        var jwtSecret = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is not configured in appsettings.");

        var jwtIssuer = configuration["Jwt:Issuer"] ?? "VeriFinca";
        var jwtAudience = configuration["Jwt:Audience"] ?? "VeriFincaUsers";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
            };
            
            // Extract token from cookie jwt if present
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (context.Request.Cookies.TryGetValue("jwt", out var token))
                    {
                        context.Token = token;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        services.AddProblemDetails();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddHttpClient(); // Register HttpClient for external API calls and proxy
        services.AddHealthChecks()
            .AddSqlServer(configuration.GetConnectionString("DefaultConnection") ?? string.Empty, name: "Database")
            .AddCheck("BlobStorage", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Blob storage ready"));
        
        services.AddCors(options =>
        {
            options.AddPolicy("ViteDev", builder =>
                builder.WithOrigins("http://localhost:5173", "http://localhost:3000")
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .AllowCredentials());
        });

        return services;
    }
}
