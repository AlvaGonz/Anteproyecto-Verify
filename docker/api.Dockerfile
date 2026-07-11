## ── Stage 1: Restore ────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS restore
WORKDIR /src

# Copy project manifests first — this layer is cached until any .csproj or .sln changes
COPY src/backend/Domain/Domain.csproj          src/backend/Domain/
COPY src/backend/Application/Application.csproj src/backend/Application/
COPY src/backend/Infrastructure/Infrastructure.csproj src/backend/Infrastructure/
COPY src/backend/Api/Api.csproj                src/backend/Api/
COPY *.sln ./

RUN dotnet restore src/backend/Api/Api.csproj --locked-mode

## ── Stage 2: Build & Publish ─────────────────────────────────────────────────
FROM restore AS publish
COPY src/backend ./src/backend

RUN dotnet publish src/backend/Api/Api.csproj \
      -c Release \
      --no-restore \
      -o /app/publish \
      /p:UseAppHost=false

## ── Stage 3: Production Runtime ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Disable diagnostics not needed in production
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true \
    DOTNET_CLI_TELEMETRY_OPTOUT=true \
    ASPNETCORE_URLS=http://+:8080 \
    DOTNET_RUNNING_IN_CONTAINER=true

WORKDIR /app

# Non-root user for least-privilege execution
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

COPY --from=publish --chown=appuser:appgroup /app/publish .

USER appuser

EXPOSE 8080

ENTRYPOINT ["dotnet", "Api.dll"]
