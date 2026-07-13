dotnet tool install --global dotnet-ef
export PATH="$PATH:/root/.dotnet/tools"
dotnet restore Api/Api.csproj
dotnet ef migrations add AddPasswordResetToken --project Infrastructure/Infrastructure.csproj --startup-project Api/Api.csproj --output-dir Persistence/Migrations
