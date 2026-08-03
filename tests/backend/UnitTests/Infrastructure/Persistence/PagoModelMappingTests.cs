using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace UnitTests;

public class PagoModelMappingTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=localhost;Database=unused;User Id=unused;Password=unused;TrustServerCertificate=True")
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public void Pago_Entity_Maps_To_Pagos_Table_Not_PagosLegacy()
    {
        using var db = CreateContext();
        var entityType = db.Model.FindEntityType(typeof(Pago));

        Assert.NotNull(entityType);
        Assert.Equal("Pagos", entityType!.GetTableName());
    }

    [Fact]
    public void Pago_Relationships_Use_Real_Fk_Properties_Not_Shadow_Columns()
    {
        using var db = CreateContext();
        var entityType = db.Model.FindEntityType(typeof(Pago));

        Assert.NotNull(entityType);
        Assert.Equal(2, entityType!.GetForeignKeys().Count());
        foreach (var fk in entityType.GetForeignKeys())
        {
            Assert.DoesNotContain(fk.Properties, p => p.IsShadowProperty());
        }
    }
}
