# שלב ראשון - Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# העתקת קבצי פרויקט (csproj)
COPY TaxManagerServer.sln ./
COPY AaxManagerServer.API/TaxManagerServer.API.csproj ./AaxManagerServer.API/
COPY TaxManagerServer.Core/TaxManagerServer.Core.csproj ./TaxManagerServer.Core/
COPY TaxManagerServer.Data/TaxManagerServer.Data.csproj ./TaxManagerServer.Data/
COPY TaxManagerServer.Service/TaxManagerServer.Service.csproj ./TaxManagerServer.Service/

# שחזור חבילות NuGet
RUN dotnet restore

# העתקת כל קבצי הקוד
COPY . ./

# בניית האפליקציה במצב Release
RUN dotnet publish AaxManagerServer.API/TaxManagerServer.API.csproj -c Release -o /app/publish --no-restore

# שלב שני - Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# יצירת משתמש לא-root לאבטחה
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 appuser

# התקנת חבילות נוספות הנדרשות (במידת הצורך)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# העתקת קבצי האפליקציה מה-build stage
COPY --from=build /app/publish .

# שינוי בעלות הקבצים למשתמש appuser
RUN chown -R appuser:appgroup /app
USER appuser

# חשיפת פורט
EXPOSE 8080

# הגדרת משתני סביבה
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# הפעלת האפליקציה
ENTRYPOINT ["dotnet", "TaxManagerServer.API.dll"]