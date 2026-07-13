FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Domain/Domain.csproj Domain/
COPY Application/Application.csproj Application/
COPY Infrastructure/Infrastructure.csproj Infrastructure/
COPY Api/Api.csproj Api/
RUN dotnet restore Api/Api.csproj

COPY . .
RUN dotnet publish Api/Api.csproj -c Release -o /app/publish

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