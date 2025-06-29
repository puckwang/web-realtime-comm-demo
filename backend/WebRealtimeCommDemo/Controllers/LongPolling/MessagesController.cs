using Microsoft.AspNetCore.Mvc;
using WebRealtimeCommDemo.Models;
using WebRealtimeCommDemo.Services;

namespace WebRealtimeCommDemo.Controllers.LongPolling;

[ApiController]
[Route("api/long-polling/messages")]
public class MessagesController(MessagesService messagesService) : ControllerBase
{
    /// <summary>
    /// 取得指定時間後的訊息 (用於 Polling)
    /// </summary>
    [HttpGet]
    [ProducesResponseType<List<Message>>(200)]
    public IActionResult GetMessages()
    {
        var messages = messagesService.GetMessages(DateTimeOffset.MinValue);

        return Ok(messages);
    }
    
    /// <summary>
    /// Long Polling 取得訊息
    /// </summary>
    [HttpGet("receive")]
    [ProducesResponseType<List<Message>>(200)]
    public async Task<IActionResult> GetMessages(
        [FromQuery] DateTimeOffset since,
        CancellationToken cancellationToken = default
    )
    {
        // 首先檢查是否已有新訊息
        var existingMessages = messagesService.GetMessages(since);
        if (existingMessages.Any())
        {
            return Ok(existingMessages);
        }

        // 如果沒有新訊息，開始 Long Polling
        var tcs = new TaskCompletionSource<bool>();

        // 事件處理器
        void OnNewMessageReceived(object? sender, EventArgs e)
        {
            // 通知等待中的客戶端有新訊息
            tcs.TrySetResult(true);
        }

        // 註冊事件
        messagesService.NewMessageReceived += OnNewMessageReceived;

        try
        {
            // 設定超時
            using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            // 註冊取消回調
            combinedCts.Token.Register(() => tcs.TrySetCanceled());

            // 等待新訊息或超時
            await tcs.Task;

            // 檢查是否有新訊息
            var newMessages = messagesService.GetMessages(since);

            return Ok(newMessages);
        }
        catch (OperationCanceledException)
        {
            // 超時或取消，返回空結果
            return Ok(Array.Empty<Message>());
        }
        finally
        {
            // 取消註冊事件
            messagesService.NewMessageReceived -= OnNewMessageReceived;
        }
    }

    /// <summary>
    /// 發送新訊息
    /// </summary>
    [HttpPost("send")]
    public IActionResult SendMessage([FromBody] SendMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new { error = "訊息內容不能為空" });
        }

        var message = messagesService.SendMessage(request.Content, request.Sender ?? "Anonymous");

        return Ok(message);
    }
}