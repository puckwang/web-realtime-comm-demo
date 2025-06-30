using WebRealtimeCommDemo.Utils;

namespace WebRealtimeCommDemo.Demos.WebSocket;

public static class WebSocketExtensions
{
    /// <summary>
    /// 註冊 WebSocket 服務和端點
    /// </summary>
    public static WebApplication UseMessagesWebSocket(this WebApplication app)
    {
        var options = new WebSocketOptions
        {
            KeepAliveInterval = TimeSpan.FromSeconds(30)
        };
        foreach (var corsOrigin in CorsUtils.GetCorsOrigins(app))
        {
            options.AllowedOrigins.Add(corsOrigin);
        }

        app.UseWebSockets(options);

        var webSocketManager = app.Services.GetRequiredService<MessagesWebSocketManager>();
        webSocketManager.MapWebSocketEndpoints(app);

        return app;
    }
}