using Microsoft.AspNetCore.SignalR;
using WebRealtimeCommDemo.Services;

namespace WebRealtimeCommDemo.Demos.SignalR;

public class MessagesHub : Hub
{
    private readonly MessagesService _messagesService;

    public MessagesHub(MessagesService messagesService)
    {
        _messagesService = messagesService;
    }

    /// <summary>
    /// 用戶端發送訊息的方法
    /// </summary>
    /// <param name="content">訊息內容</param>
    /// <param name="sender">發送者名稱</param>
    public async Task SendMessage(string content, string sender = "Anonymous")
    {
        try
        {
            // 使用 MessagesService 發送訊息
            var message = _messagesService.SendMessage(content, sender);

            // 廣播給所有連接的用戶端
            await Clients.All.SendAsync("ReceiveMessage", new
            {
                Id = message.Id,
                Content = message.Content,
                Sender = message.Sender,
                Timestamp = message.Timestamp
            });
        }
        catch (ArgumentException ex)
        {
            // 向發送者回傳錯誤訊息
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    /// <summary>
    /// 獲取指定時間點之後的所有訊息
    /// </summary>
    /// <param name="since">起始時間點</param>
    public async Task GetMessages(DateTimeOffset since)
    {
        var messages = _messagesService.GetMessages(since);
        await Clients.Caller.SendAsync("MessagesHistory", messages);
    }

    /// <summary>
    /// 獲取最近的訊息（預設為最近1小時）
    /// </summary>
    public async Task GetRecentMessages()
    {
        var since = DateTimeOffset.UtcNow.AddHours(-1);
        var messages = _messagesService.GetMessages(since);
        await Clients.Caller.SendAsync("MessagesHistory", messages);
    }

    /// <summary>
    /// 用戶端連接時的處理
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("Connected", $"連接 ID: {Context.ConnectionId}");

        // 自動發送最近一小時的訊息給新連接的用戶端
        var since = DateTimeOffset.UtcNow.AddHours(-1);
        var messages = _messagesService.GetMessages(since);
        await Clients.Caller.SendAsync("MessagesHistory", messages);

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// 用戶端斷線時的處理
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
