# Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["HotelManager.API/HotelManager.API.csproj", "HotelManager.API/"]
RUN dotnet restore "HotelManager.API/HotelManager.API.csproj"
COPY . .
WORKDIR /src/HotelManager.API
RUN dotnet build "HotelManager.API.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "HotelManager.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
# SQLite: diretório para o arquivo .db (montado como volume no compose)
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "HotelManager.API.dll"]
