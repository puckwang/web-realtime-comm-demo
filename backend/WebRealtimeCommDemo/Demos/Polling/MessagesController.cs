using Microsoft.AspNetCore.Mvc;
using WebRealtimeCommDemo.Models;
using WebRealtimeCommDemo.Services;

namespace WebRealtimeCommDemo.Demos.Polling;

[ApiController]
[Route("api/polling/messages")]
public class MessagesController : ControllerBase
{
    private readonly MessagesService _messagesService;

    public MessagesController(MessagesService messagesService)
    {
        _messagesService = messagesService;
    }

    /// <summary>
    /// 取得指定時間後的訊息 (用於 Polling)
    /// </summary>
    [HttpGet]
    [ProducesResponseType<List<Message>>(200)]
    public IActionResult GetMessages([FromQuery] DateTimeOffset? since = null)
    {
        // 如果沒有提供 since 參數，使用很久以前的時間來取得所有訊息
        var sinceTime = since ?? DateTimeOffset.MinValue;

        var messages = _messagesService.GetMessages(sinceTime);

        return Ok(messages);
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

        var message = _messagesService.SendMessage(request.Content, request.Sender ?? "Anonymous");

        return Ok(message);
    }
}