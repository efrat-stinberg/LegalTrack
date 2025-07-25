# ��� ����� - Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# ����� ���� ������ (csproj)
COPY TaxManagerServer.sln ./
COPY AaxManagerServer.API/TaxManagerServer.API.csproj ./AaxManagerServer.API/
COPY TaxManagerServer.Core/TaxManagerServer.Core.csproj ./TaxManagerServer.Core/
COPY TaxManagerServer.Data/TaxManagerServer.Data.csproj ./TaxManagerServer.Data/
COPY TaxManagerServer.Service/TaxManagerServer.Service.csproj ./TaxManagerServer.Service/

# ����� ������ NuGet
RUN dotnet restore

# ����� �� ���� ����
COPY . ./

# ����� ��������� ���� Release
RUN dotnet publish AaxManagerServer.API/TaxManagerServer.API.csproj -c Release -o /app/publish --no-restore

# ��� ��� - Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# ����� ����� ��-root ������
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 appuser

# ����� ������ ������ ������� (����� �����)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ����� ���� ��������� ��-build stage
COPY --from=build /app/publish .

# ����� ����� ������ ������ appuser
RUN chown -R appuser:appgroup /app
USER appuser

# ����� ����
EXPOSE 8080

# ����� ����� �����
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# ����� ���������
ENTRYPOINT ["dotnet", "TaxManagerServer.API.dll"]