#!/bin/bash
dotnet tool install --global dotnet-ef
export PATH="$PATH:/root/.dotnet/tools"
dotnet restore Api/Api.csproj
dotnet restore Infrastructure/Infrastructure.csproj
dotnet ef migrations add AddSuperficieM2ToProjects --project Infrastructure/Infrastructure.csproj --startup-project Api/Api.csproj --output-dir Infrastructure/Persistence/Migrations
