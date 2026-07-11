FROM mcr.azure.cn/dotnet/sdk:8.0 AS build

WORKDIR /src
# Copy only necessary project files (cache layer)
COPY src/backend/Domain/Domain.csproj src/backend/Domain/
COPY src/backend/Application/Application.csproj src/backend/Application/
COPY src/backend/Infrastructure/Infrastructure.csproj src/backend/Infrastructure/
COPY src/backend/Api/Api.csproj src/backend/Api/
COPY *.sln ./

# Restore dependencies (cached if .csproj files unchanged)
RUN dotnet restore

# Copy the rest of source
COPY src/backend ./src/backend

# Build the application
RUN dotnet build -c Release --no-restore src/backend/Api/Api.csproj -o /app/build

# Development runtime image
FROM mcr.azure.cn/dotnet/sdk:8.0

WORKDIR /src
COPY . .
WORKDIR /src/src/backend/Api

# Expose port
EXPOSE 8080
EXPOSE 5050

# Configure dotnet environment
ENV DOTNET_CLI_HOME=/tmp
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true
ENV DOTNET_CLI_TELEMETRY_OPTOUT=true

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:8080"]
