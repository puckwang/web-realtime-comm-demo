using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using WebRealtimeCommDemo.Models;
using WebRealtimeCommDemo.Services;

namespace WebRealtimeCommDemo.Controllers.ServerSentEvent;

[ApiController]
[Route("api/server-sent-event/messages")]
public class MessagesController(MessagesService messagesService) : ControllerBase
{
    /// <summary>
    /// Server Sent Event 端點 - 持續推送新訊息給客戶端
    /// </summary>
    [HttpGet("stream")]
    public async Task StreamMessages(
        [FromQuery] DateTimeOffset? since = null,
        CancellationToken cancellationToken = default
    )
    {
        // 設定 SSE 回應標頭
        Response.ContentType = "text/event-stream";
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");
        Response.Headers.Append("Access-Control-Allow-Origin", "*");

        var sinceTime = since ?? DateTimeOffset.MinValue;

        try
        {
            // 首先發送既有的訊息
            var existingMessages = messagesService.GetMessages(sinceTime);
            foreach (var message in existingMessages)
            {
                await SendSseMessage("message", message, cancellationToken);
            }

            // 發送連線建立成功事件
            await SendSseEvent("connected", "SSE connection established", cancellationToken);

            // 使用 TaskCompletionSource 來等待新訊息
            while (!cancellationToken.IsCancellationRequested)
            {
                var tcs = new TaskCompletionSource<bool>();

                // 事件處理器
                void OnNewMessageReceived(object? sender, EventArgs e)
                {
                    tcs.TrySetResult(true);
                }

                // 註冊事件
                messagesService.NewMessageReceived += OnNewMessageReceived;

                try
                {
                    // 設定心跳超時（每 30 秒發送一次心跳）
                    using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                    using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

                    // 註冊取消回調
                    combinedCts.Token.Register(() => tcs.TrySetCanceled());

                    // 等待新訊息或心跳超時
                    var completed = await tcs.Task;

                    if (completed && !cancellationToken.IsCancellationRequested)
                    {
                        // 有新訊息，取得並發送所有新訊息
                        var newMessages = messagesService.GetMessages(sinceTime);
                        var latestMessages = newMessages.Where(m => m.Timestamp > sinceTime).ToList();

                        foreach (var message in latestMessages)
                        {
                            await SendSseMessage("message", message, cancellationToken);
                            // 更新 sinceTime 以避免重複發送
                            if (message.Timestamp > sinceTime)
                            {
                                sinceTime = message.Timestamp;
                            }
                        }
                    }
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    // 客戶端中斷連線
                    break;
                }
                catch (OperationCanceledException)
                {
                    // 心跳超時，發送心跳訊息
                    await SendSseEvent("heartbeat", DateTimeOffset.UtcNow.ToString("O"), cancellationToken);
                }
                finally
                {
                    // 取消註冊事件
                    messagesService.NewMessageReceived -= OnNewMessageReceived;
                }
            }
        }
        catch (Exception ex)
        {
            // 發送錯誤事件
            await SendSseEvent("error", ex.Message, cancellationToken);
        }
        finally
        {
            // 發送連線關閉事件
            try
            {
                await SendSseEvent("disconnected", "SSE connection closed", cancellationToken);
            }
            catch
            {
                // 忽略關閉時的錯誤
            }
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

    /// <summary>
    /// 發送 SSE 訊息事件
    /// </summary>
    private async Task SendSseMessage(string eventType, Message message, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(message, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await SendSseEvent(eventType, json, cancellationToken);
    }

    /// <summary>
    /// 發送 SSE 事件
    /// </summary>
    private async Task SendSseEvent(string eventType, string data, CancellationToken cancellationToken)
    {
        var sseData = $"event: {eventType}\ndata: {data}\n\n";
        var bytes = System.Text.Encoding.UTF8.GetBytes(sseData);

        await Response.Body.WriteAsync(bytes, cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }
}