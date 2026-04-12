# Research & Findings

## Project Structure
- Monorepo-ish structure: Root `package.json` and a dedicated `src/frontend/web` frontend project.
- Errors in `src/frontend/web` are due to missing `node_modules`.

## Analysis of Errors
1. **Module Resolution (Frontend)**: "Cannot find module 'react'" etc. are due to missing local packages.
2. **Build Error CS0117 (Backend)**: 
    - `ProjectCategory` was missing the `Industrial` definition.
    - Resulted in critical failure of `api.Dockerfile` during `dotnet publish`.
    - **Resolution**: Added `Industrial = 5` to `ProjectCategory.cs`.
3. **Broken Contracts (Backend Architecture)**:
    - `Proyecto`: Missing `PromotorId` (Guid) and `RncPromotor` (string).
    - `Hallazgo`: Constructor mismatch (called with 7 args, defined with 6). Missing `SistemaOrigen` property.
    - `IReporteBuilder`: Method name mismatch (`ConstruirReporteAsync` vs `BuildReporteAsync`).
    - `Validacion`: Missing `TipoValidacion` and `Estado` aliases for public queries.

## Backend Review Findings (Resolved)
- **Enums**: 
    - `IntegrityStatus`: Added `Warning` and `Critical`.
    - `ProjectStatus`: Added `Approved` and `Verified`.
    - `ProjectCategory`: Added `Industrial`.
- **Property Mismatches**: 
    - `Proyecto`: Added `Status`, `Estado`, `PromotorId`, `RncPromotor`, and `IdentificacionCatastral` aliases.
    - `Usuario`: Added `Email` alias.
    - `Validacion`: Added `Estado` and `TipoValidacion` aliases.
- **Entity Consolidation**:
    - `Hallazgo`: Updated to 7-argument constructor. Added `SistemaOrigen`, `Severity`, `Tipo`, `FuenteValidacion`, and `FechaDeteccionUtc` aliases for compatibility.
- **API Attributes**: Corrected `[PATCH]` to `[HttpPatch]` in `ProjectDocumentsController`.
- **Dependencies**: Fixed missing `Microsoft.Extensions.Configuration` in `Application.csproj`.
- **Usings**: Fixed several missing using directives in Application handlers.
- **Interfaces**: Renamed `IReporteBuilder.ConstruirReporteAsync` to `BuildReporteAsync`.
