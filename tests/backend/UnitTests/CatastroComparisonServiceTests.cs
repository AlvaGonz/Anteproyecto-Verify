namespace UnitTests;

using System;
using Application.DTOs.Integrations;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Xunit;

public class CatastroComparisonServiceTests
{
    private readonly CatastroComparisonService _service;

    public CatastroComparisonServiceTests()
    {
        _service = new CatastroComparisonService();
    }

    [Fact]
    public void Compare_ShouldReturnNoDiscrepancies_WhenDataMatches()
    {
        // Arrange
        var proyecto = new Proyecto("Test", "Loc", Guid.NewGuid(), ProjectCategory.Residencial, null, "DC-123");
        proyecto.UpdateDetails("Test", "Loc", "18.0,-69.0", null, ProjectCategory.Residencial, null, "DC-123");

        var catastroData = new CatastroResponseDto
        {
            IsSuccess = true,
            DesignacionCatastral = "DC-123",
            CoordenadasGps = "18.0,-69.0"
        };

        // Act
        var result = _service.Compare(proyecto, catastroData);

        // Assert
        Assert.False(result.HasDiscrepancies);
        Assert.Null(result.LocationDiscrepancy);
        Assert.Null(result.LimitsDiscrepancy);
    }

    [Fact]
    public void Compare_ShouldReturnDiscrepancies_WhenGpsDiffers()
    {
        // Arrange
        var proyecto = new Proyecto("Test", "Loc", Guid.NewGuid(), ProjectCategory.Residencial, null, "DC-123");
        proyecto.UpdateDetails("Test", "Loc", "18.0,-69.0", null, ProjectCategory.Residencial, null, "DC-123");

        var catastroData = new CatastroResponseDto
        {
            IsSuccess = true,
            DesignacionCatastral = "DC-123",
            CoordenadasGps = "19.0,-70.0"
        };

        // Act
        var result = _service.Compare(proyecto, catastroData);

        // Assert
        Assert.True(result.HasDiscrepancies);
        Assert.NotNull(result.LocationDiscrepancy);
        Assert.Null(result.LimitsDiscrepancy);
    }

    [Fact]
    public void Compare_ShouldReturnDiscrepancies_WhenDesignacionDiffers()
    {
        // Arrange
        var proyecto = new Proyecto("Test", "Loc", Guid.NewGuid(), ProjectCategory.Residencial, null, "DC-123");
        proyecto.UpdateDetails("Test", "Loc", "18.0,-69.0", null, ProjectCategory.Residencial, null, "DC-123");

        var catastroData = new CatastroResponseDto
        {
            IsSuccess = true,
            DesignacionCatastral = "DC-456",
            CoordenadasGps = "18.0,-69.0"
        };

        // Act
        var result = _service.Compare(proyecto, catastroData);

        // Assert
        Assert.True(result.HasDiscrepancies);
        Assert.Null(result.LocationDiscrepancy);
        Assert.NotNull(result.LimitsDiscrepancy);
    }
}
