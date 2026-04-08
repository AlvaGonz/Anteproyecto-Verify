using Api.Extensions;
using Application.DependencyInjection;
using Infrastructure.DependencyInjection;
using Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

var useMock = builder.Configuration.GetValue<bool>("UseMockData");
if (useMock)
{
    await AppDbContextSeeder.SeedAsync(app.Services);
}

app.UseApiMiddleware();

app.Run();
