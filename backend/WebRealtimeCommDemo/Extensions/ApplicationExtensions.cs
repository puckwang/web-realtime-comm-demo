using WebRealtimeCommDemo.Utils;

namespace WebRealtimeCommDemo.Extensions;

public static class ApplicationExtensions
{
    public static WebApplication UseCorsFromEnv(this WebApplication app)
    {
        

        app.UseCors(o => o
            .WithOrigins(CorsUtils.GetCorsOrigins(app).ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
        );

        return app;
    }
}