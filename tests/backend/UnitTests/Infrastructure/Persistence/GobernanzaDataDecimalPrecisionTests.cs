using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace UnitTests;

public class GobernanzaDataDecimalPrecisionTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=localhost;Database=unused;User Id=unused;Password=unused;TrustServerCertificate=True")
            .Options;
        return new AppDbContext(options);
    }

    private static (int? Precision, int? Scale) GetPrecision(AppDbContext db, Type entityType, string propertyName)
    {
        var property = db.Model.FindEntityType(entityType)!.GetProperty(propertyName);
        return (property.GetPrecision(), property.GetScale());
    }

    [Theory]
    [InlineData(nameof(CatastroTitulo.Latitud))]
    [InlineData(nameof(CatastroTitulo.Longitud))]
    public void CatastroTitulo_Coordinate_Decimal_Has_Gps_Precision(string propertyName)
    {
        using var db = CreateContext();

        var (precision, scale) = GetPrecision(db, typeof(CatastroTitulo), propertyName);

        Assert.Equal(18, precision);
        Assert.Equal(6, scale);
    }

    [Fact]
    public void CatastroTitulo_Superficie_Decimal_Has_Explicit_Precision()
    {
        using var db = CreateContext();

        var (precision, scale) = GetPrecision(db, typeof(CatastroTitulo), nameof(CatastroTitulo.Superficie));

        Assert.Equal(18, precision);
        Assert.Equal(2, scale);
    }

    [Theory]
    [InlineData(nameof(PermisoSuelo.Latitud))]
    [InlineData(nameof(PermisoSuelo.Longitud))]
    public void PermisoSuelo_Coordinate_Decimal_Has_Gps_Precision(string propertyName)
    {
        using var db = CreateContext();

        var (precision, scale) = GetPrecision(db, typeof(PermisoSuelo), propertyName);

        Assert.Equal(18, precision);
        Assert.Equal(6, scale);
    }

    [Fact]
    public void PermisoSuelo_Superficie_Decimal_Has_Explicit_Precision()
    {
        using var db = CreateContext();

        var (precision, scale) = GetPrecision(db, typeof(PermisoSuelo), nameof(PermisoSuelo.Superficie));

        Assert.Equal(18, precision);
        Assert.Equal(2, scale);
    }

    [Fact]
    public void PagoIPI_CuotaIpi_Decimal_Has_Explicit_Precision()
    {
        using var db = CreateContext();

        var (precision, scale) = GetPrecision(db, typeof(PagoIPI), nameof(PagoIPI.Cuota_ipi));

        Assert.Equal(18, precision);
        Assert.Equal(2, scale);
    }
}
