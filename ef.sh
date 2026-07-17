#!/bin/bash
dotnet tool install --global dotnet-ef
export PATH="$PATH:/root/.dotnet/tools"
cd /app/src/backend
dotnet ef migrations add AddProyectoEstadosAndMigrateData --project Infrastructure/Infrastructure.csproj --startup-project Api/Api.csproj --output-dir Persistence/Migrations
