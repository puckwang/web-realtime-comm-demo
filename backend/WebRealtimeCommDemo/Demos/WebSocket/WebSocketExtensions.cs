namespace WebRealtimeCommDemo.Demos.WebSocket;

public static class WebSocketExtensions
{
    /// <summary>
    /// 註冊 WebSocket 服務和端點
    /// </summary>
    public static WebApplication UseMessagesWebSocket(this WebApplication app)
    {
        app.UseWebSockets();
        
        var webSocketManager = app.Services.GetRequiredService<MessagesWebSocketManager>();
        webSocketManager.MapWebSocketEndpoints(app);
        
        return app;
    }
}
