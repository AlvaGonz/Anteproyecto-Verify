# Build Error Diagnosis: TC-002 Coordinates Validation

> Date: 2026-06-29 | Agent: build-error-resolver | Status: Analysis
> Scenario: ValidarTerritorioHandler returns FAIL for valid coordinates (19.3028, -70.2467)

## Error
```
[xUnit] VeriFinca.Application.Tests.Handlers.ValidarTerritorioHandlerTests.Test_ValidCoordinates_ReturnsPass
Expected: True
Actual: False
```

## Root Cause Analysis

### Possible Cause 1: Geofencing Boundary Calculation (HIGH)
**Probability:** 60%
**Detail:** The geofencing algorithm may use a different coordinate reference system (CRS). The handler might expect WGS84 decimal degrees but the test coordinates might be in a projected CRS.
**Diagnostic:** Log the raw GPS input and the computed boundary polygon. Check if the cadastral designation "SANTIAGO-001-12345" maps to a polygon that excludes (19.3028, -70.2467).

### Possible Cause 2: API Mock Mismatch (MEDIUM)
**Probability:** 25%
**Detail:** The Catastro API mock in WireMock.NET may not return the correct boundary polygon for this cadastral designation. The real API might return a different polygon.
**Diagnostic:** Verify WireMock mapping for `SANTIAGO-001-12345` returns expected coordinates.

### Possible Cause 3: Coordinate Precision (LOW)
**Probability:** 15%
**Detail:** Floating-point precision in the haversine distance calculation might cause edge-of-boundary coordinates to fail.
**Diagnostic:** Add an epsilon tolerance (1e-6) to the boundary check.

## Recommended Fix
1. Log boundary polygon + test coordinates in `ValidarTerritorioHandler`
2. Verify WireMock stub for `SANTIAGO-001-12345` returns polygon containing (19.3028, -70.2467)
3. If boundary is correct, add 1e-6 tolerance to `Polygon.Contains(Coordinate)`
4. Add reproduction test for edge-of-boundary case

## Reproduction Test Approach
```csharp
[Fact]
public void Test_Coordinates_Inside_Polygon_With_Tolerance()
{
    var handler = new ValidarTerritorioHandler(mockCatastroClient.Object);
    var result = handler.Handle(new ValidarTerritorioCommand 
    { 
        Latitud = 19.3028, 
        Longitud = -70.2467, 
        DesignacionCatastral = "SANTIAGO-001-12345" 
    }, CancellationToken.None);
    
    Assert.True(result.IsSuccess);
}
```

## Circuit Breaker
**Attempts:** 1/3
**Status:** Investigation in progress — not tripped.
