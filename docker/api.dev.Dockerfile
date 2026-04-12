FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /src
# We expect the context to be the project root
COPY . .
WORKDIR /src/src/backend/Api
# Expose port
EXPOSE 8080
# Run with dotnet watch
ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:8080"]
