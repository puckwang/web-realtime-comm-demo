# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY WebRealtimeCommDemo/*.csproj ./WebRealtimeCommDemo/
RUN dotnet restore "WebRealtimeCommDemo/WebRealtimeCommDemo.csproj"

# Copy the rest of the code
COPY WebRealtimeCommDemo/. ./WebRealtimeCommDemo/

# Build the application
WORKDIR "/src/WebRealtimeCommDemo"
RUN dotnet build "WebRealtimeCommDemo.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "WebRealtimeCommDemo.csproj" -c Release -o /app/publish

# Final image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose the port the app will run on
EXPOSE 5000

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000;
ENV ASPNETCORE_ENVIRONMENT=Production

# Start the application
ENTRYPOINT ["dotnet", "WebRealtimeCommDemo.dll"]
