# =======================================================
# DOCKERFILE - OVERCRITIC BACKEND API (.NET 8 C#)
# Compatível com Render, Railway, Fly.io e Docker Desktop
# =======================================================

# 1. Estágio de Compilação (SDK Completo)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o arquivo de projeto e restaura dependências
COPY ["backend/Overcritic.Api.csproj", "backend/"]
RUN dotnet restore "backend/Overcritic.Api.csproj"

# Copia o código-fonte restante e compila
COPY backend/ backend/
WORKDIR "/src/backend"
RUN dotnet publish "Overcritic.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. Estágio de Execução (Runtime leve e seguro)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Variáveis padrão de ambiente e portas
ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Overcritic.Api.dll"]
