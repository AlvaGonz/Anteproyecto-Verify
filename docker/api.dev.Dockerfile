FROM mcr.azure.cn/dotnet/sdk:8.0
WORKDIR /src
# We expect the context to be the project root
COPY . .
WORKDIR /src/src/backend/Api
# Expose port
EXPOSE 8080
EXPOSE 5050
# Configure dotnet environment to avoid writing to read-only or nonexistent home directory
ENV DOTNET_CLI_HOME=/tmp
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true
ENV DOTNET_CLI_TELEMETRY_OPTOUT=true

# Run with dotnet watch
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
# USER appuser
ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:8080"]
