#!/bin/bash
dotnet tool install --global dotnet-ef
export PATH="$PATH:/root/.dotnet/tools"
dotnet ef migrations add AddSesionesUsuario --project Infrastructure/Infrastructure.csproj --startup-project Api/Api.csproj --output-dir Persistence/Migrations
