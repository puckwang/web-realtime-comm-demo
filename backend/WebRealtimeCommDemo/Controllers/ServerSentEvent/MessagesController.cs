using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using WebRealtimeCommDemo.Models;
using WebRealtimeCommDemo.Services;

namespace WebRealtimeCommDemo.Controllers.ServerSentEvent;

[ApiController]
[Route("api/server-sent-event/messages")]
public class MessagesController(MessagesService messagesService, IHostApplicationLifetime applicationLifetime) : ControllerBase
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

        var sinceTime = since ?? DateTimeOffset.MinValue;

        // 建立結合應用程式關閉和請求取消的 CancellationToken
        using var appShutdownCts = CancellationTokenSource.CreateLinkedTokenSource(
            cancellationToken,
            applicationLifetime.ApplicationStopping,
            HttpContext.RequestAborted
        );

        var combinedCancellationToken = appShutdownCts.Token;

        try
        {
            // 發送連線建立成功事件
            await SendSseConnected(combinedCancellationToken);
            
            // 首先發送既有的訊息
            var existingMessages = messagesService.GetMessages(sinceTime);
            foreach (var message in existingMessages)
            {
                await SendSseMessage("message", message, combinedCancellationToken);
            }

            // 使用 TaskCompletionSource 來等待新訊息
            while (!combinedCancellationToken.IsCancellationRequested)
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
                    using var messageCts = CancellationTokenSource.CreateLinkedTokenSource(
                        combinedCancellationToken, 
                        timeoutCts.Token
                    );

                    // 註冊取消回調
                    messageCts.Token.Register(() => tcs.TrySetCanceled());

                    // 等待新訊息或心跳超時
                    var completed = await tcs.Task;

                    if (completed && !combinedCancellationToken.IsCancellationRequested)
                    {
                        // 有新訊息，取得並發送所有新訊息
                        var newMessages = messagesService.GetMessages(sinceTime);
                        var latestMessages = newMessages.Where(m => m.Timestamp > sinceTime).ToList();

                        foreach (var message in latestMessages)
                        {
                            await SendSseMessage("message", message, combinedCancellationToken);
                            // 更新 sinceTime 以避免重複發送
                            if (message.Timestamp > sinceTime)
                            {
                                sinceTime = message.Timestamp;
                            }
                        }
                    }
                }
                catch (OperationCanceledException) when (applicationLifetime.ApplicationStopping.IsCancellationRequested)
                {
                    // 應用程式正在關閉
                    await SendSseEvent("server-shutdown", "Server is shutting down", CancellationToken.None);
                    break;
                }
                catch (OperationCanceledException) when (HttpContext.RequestAborted.IsCancellationRequested)
                {
                    // 客戶端中斷連線
                    break;
                }
                catch (OperationCanceledException) when (combinedCancellationToken.IsCancellationRequested)
                {
                    // 其他取消原因
                    break;
                }
                catch (OperationCanceledException)
                {
                    // 心跳超時，發送心跳訊息
                    if (!combinedCancellationToken.IsCancellationRequested)
                    {
                        await SendSseEvent("heartbeat", DateTimeOffset.UtcNow.ToString("O"), combinedCancellationToken);
                    }
                }
                finally
                {
                    // 取消註冊事件
                    messagesService.NewMessageReceived -= OnNewMessageReceived;
                }
            }
        }
        catch (Exception ex) when (!combinedCancellationToken.IsCancellationRequested)
        {
            // 只有在非取消的情況下才發送錯誤事件
            try
            {
                await SendSseEvent("error", ex.Message, combinedCancellationToken);
            }
            catch
            {
                // 忽略發送錯誤事件時的錯誤
            }
        }
        finally
        {
            // 發送連線關閉事件
            try
            {
                string disconnectReason = applicationLifetime.ApplicationStopping.IsCancellationRequested
                    ? "Server shutdown"
                    : HttpContext.RequestAborted.IsCancellationRequested
                        ? "Client disconnected"
                        : "Connection closed";

                await SendSseEvent("disconnected", disconnectReason, CancellationToken.None);
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
    /// 發送 SSE 已連線事件
    /// </summary>
    private async Task SendSseConnected(CancellationToken cancellationToken)
    {
        await SendSseEvent("connected", "SSE connection established\nretry: 5000", cancellationToken);
    }

    /// <summary>
    /// 發送 SSE 事件
    /// </summary>
    private async Task SendSseEvent(string eventType, string data, CancellationToken cancellationToken)
    {
        try
        {
            var sseData = $"event: {eventType}\ndata: {data}\n\n";
            var bytes = System.Text.Encoding.UTF8.GetBytes(sseData);

            await Response.Body.WriteAsync(bytes, cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
        catch (InvalidOperationException)
        {
            // 連線可能已經關閉，忽略此錯誤
        }
    }
}