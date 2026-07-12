FROM mcr.azure.cn/dotnet/aspnet:8.0

WORKDIR /app
EXPOSE 8080
EXPOSE 5050

ENV DOTNET_CLI_HOME=/tmp
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true
ENV DOTNET_CLI_TELEMETRY_OPTOUT=true

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy pre-built application from local build
COPY src/backend/Api/bin/Release/net8.0/ ./

ENTRYPOINT ["dotnet", "Api.dll", "--urls", "http://0.0.0.0:8080"]