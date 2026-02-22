# Runtime (léger) : exécute l'API
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Build : compile + publish
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copie du csproj pour profiter du cache Docker
COPY ["Service Personnel/Service Personnel.csproj", "Service Personnel/"]
RUN dotnet restore "Service Personnel/Service Personnel.csproj"

# Copie du reste du code
COPY . .
WORKDIR "/src/Service Personnel"

# Publish (sortie optimisée)
RUN dotnet publish "Service Personnel.csproj" -c Release -o /app/publish

# Image finale
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Service Personnel.dll"]