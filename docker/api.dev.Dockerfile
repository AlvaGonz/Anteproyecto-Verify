FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/backend/Domain/Domain.csproj src/backend/Domain/
COPY src/backend/Application/Application.csproj src/backend/Application/
COPY src/backend/Infrastructure/Infrastructure.csproj src/backend/Infrastructure/
COPY src/backend/Api/Api.csproj src/backend/Api/
COPY *.sln ./
RUN dotnet restore src/backend/Api/Api.csproj

COPY src/backend ./src/backend
RUN dotnet publish src/backend/Api/Api.csproj -c Release -o /app/publish

FROM mcr.azure.cn/dotnet/aspnet:8.0
WORKDIR /app
EXPOSE 8080
EXPOSE 5050

ENV DOTNET_CLI_HOME=/tmp
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true
ENV DOTNET_CLI_TELEMETRY_OPTOUT=true

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy pre-built application from local build
COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "Api.dll", "--urls", "http://0.0.0.0:8080"]