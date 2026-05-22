# Enterprise Web App Bootstrap

Bootstrap de solución para un sistema web moderno enterprise-ready.

## Arquitectura
- **Backend**: ASP.NET Core 8 Web API, Clean Architecture.
- **Frontend**: React 19, TypeScript, Vite.
- **Infraestructura**: Preparado para Azure SQL y Azure Blob Storage.

## Ejecución Local (Docker)
1. Copiar `.env.example` a `.env`.
2. Ejecutar `scripts/dev-up.sh` (Linux/Mac) o `scripts/dev-up.ps1` (Windows).
3. Frontend disponible en `http://localhost:3000`.
4. Backend API disponible en `http://localhost:5000`.
5. Health checks en `http://localhost:5000/health` y `http://localhost:5000/api/status`.

## Pruebas
Para ejecutar las pruebas unitarias y de integración del backend:
```bash
cd tests/backend/UnitTests
dotnet test
cd ../IntegrationTests
dotnet test
```

Para ejecutar las pruebas del frontend:
```bash
cd src/frontend/web
pnpm install
pnpm run test
```
Para generar la migración inicial del modelo de dominio, ejecuta:
```bash
cd src/backend
dotnet ef migrations add InitialDomainModel --project Infrastructure/Infrastructure.csproj --startup-project Api/Api.csproj --output-dir Persistence/Migrations
dotnet ef database update --project Infrastructure/Infrastructure.csproj --startup-project Api/Api.csproj
```
