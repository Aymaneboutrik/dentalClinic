# Étape 1 : Builder
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copier csproj et restaurer les dépendances
COPY *.csproj ./
RUN dotnet restore

# Copier tout le reste et publier
COPY . ./
RUN dotnet publish -c Release -o out

# Étape 2 : Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "stock-api.dll"]