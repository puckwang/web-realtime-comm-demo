namespace WebRealtimeCommDemo.Utils;

public static class CorsUtils
{
    public static List<string> GetCorsOrigins(WebApplication app)
    {
        var corsOriginsEnv = Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? string.Empty;
        var corsOrigins = corsOriginsEnv.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();

        if (app.Environment.IsDevelopment())
        {
            corsOrigins.Add("http://localhost:3000");
        }

        return corsOrigins;
    }
}