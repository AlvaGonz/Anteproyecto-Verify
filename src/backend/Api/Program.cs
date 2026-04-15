using Api.Extensions;
using Application.DependencyInjection;
using Infrastructure.DependencyInjection;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

var useMock = builder.Configuration.GetValue<bool>("UseMockData");
if (app.Environment.IsDevelopment())
{
    // In local/dev we ensure the database exists so Docker bootstraps cleanly
    // even when EF migrations tooling isn't installed in the container.
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();

    await AppDbContextSeeder.SeedAsync(app.Services);
}
else if (useMock)
{
    await AppDbContextSeeder.SeedAsync(app.Services);
}

app.UseApiMiddleware();

app.Run();

public partial class Program { }
