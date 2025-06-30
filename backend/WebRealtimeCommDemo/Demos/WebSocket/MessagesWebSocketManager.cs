using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using WebRealtimeCommDemo.Models;
using WebRealtimeCommDemo.Services;
using WebRealtimeCommDemo.Utils;

namespace WebRealtimeCommDemo.Demos.WebSocket;

public class MessagesWebSocketManager
{
    private readonly ConcurrentDictionary<string, System.Net.WebSockets.WebSocket> _sockets = new();
    private readonly MessagesService _messagesService;
    private readonly ILogger<MessagesWebSocketManager> _logger;

    public MessagesWebSocketManager(MessagesService messagesService, ILogger<MessagesWebSocketManager> logger)
    {
        _messagesService = messagesService;
        _logger = logger;
    }

    public void MapWebSocketEndpoints(WebApplication app)
    {
        app.Map("/ws/messages", HandleWebSocketRequest);
    }

    private async Task HandleWebSocketRequest(HttpContext context)
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            await HandleWebSocketAsync(webSocket);
        }
        else
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync("WebSocket connections only");
        }
    }

    private async Task HandleWebSocketAsync(System.Net.WebSockets.WebSocket webSocket)
    {
        var socketId = Guid.NewGuid().ToString();
        _sockets.TryAdd(socketId, webSocket);

        _logger.LogInformation("WebSocket connected: {SocketId}", socketId);

        try
        {
            // 發送連線成功事件
            await SendConnectedEvent(webSocket);

            // 發送所有現有訊息
            await SendExistingMessages(webSocket);

            // 註冊新訊息事件監聽
            EventHandler newMessageHandler = async (sender, e) => await BroadcastLatestMessage();
            _messagesService.NewMessageReceived += newMessageHandler;

            try
            {
                await ReceiveMessages(webSocket);
            }
            finally
            {
                _messagesService.NewMessageReceived -= newMessageHandler;
            }
        }
        finally
        {
            _sockets.TryRemove(socketId, out _);
            _logger.LogInformation("WebSocket disconnected: {SocketId}", socketId);
        }
    }

    private async Task SendConnectedEvent(System.Net.WebSockets.WebSocket webSocket)
    {
        var connectEvent = new
        {
            Type = "connected",
            Message = "WebSocket connection established",
            Timestamp = DateTimeOffset.UtcNow
        };

        await SendEventToSocket(webSocket, connectEvent);
    }

    private async Task SendExistingMessages(System.Net.WebSockets.WebSocket webSocket)
    {
        try
        {
            // 取得所有現有訊息
            var existingMessages = _messagesService.GetMessages(DateTimeOffset.MinValue);
            
            if (existingMessages.Any())
            {
                foreach (var message in existingMessages.OrderBy(m => m.Timestamp))
                {
                    var messageEvent = new
                    {
                        Type = "message",
                        Data = message
                    };

                    await SendEventToSocket(webSocket, messageEvent);
                }

                _logger.LogInformation("Sent {Count} existing messages to new WebSocket connection", existingMessages.Count());
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending existing messages to WebSocket");
        }
    }

    private async Task ReceiveMessages(System.Net.WebSockets.WebSocket webSocket)
    {
        var buffer = new byte[1024 * 4];

        while (webSocket.State == WebSocketState.Open)
        {
            try
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    await ProcessMessage(message);
                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Connection closed", CancellationToken.None);
                    break;
                }
            }
            catch (WebSocketException)
            {
                break;
            }
        }
    }

    private async Task ProcessMessage(string messageJson)
    {
        try
        {
            var data = JsonUtils.Deserialize<SendMessageRequest>(messageJson);

            if (!string.IsNullOrWhiteSpace(data?.Content))
            {
                _messagesService.SendMessage(data.Content, data.Sender ?? "Anonymous");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing WebSocket message");
        }
    }

    private async Task BroadcastLatestMessage()
    {
        var latestMessages = _messagesService.GetMessages(DateTimeOffset.UtcNow.AddSeconds(-1));
        var latestMessage = latestMessages.OrderByDescending(m => m.Timestamp).FirstOrDefault();

        if (latestMessage != null)
        {
            var messageEvent = new
            {
                Type = "message",
                Data = latestMessage
            };

            var tasks = _sockets.Values
                .Where(socket => socket.State == WebSocketState.Open)
                .Select(socket => SendEventToSocket(socket, messageEvent));

            await Task.WhenAll(tasks);
        }
    }

    private async Task SendEventToSocket(System.Net.WebSockets.WebSocket socket, object eventData)
    {
        try
        {
            var json = JsonUtils.Serialize(eventData);
            var buffer = Encoding.UTF8.GetBytes(json);
            await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send event to WebSocket");
        }
    }
}