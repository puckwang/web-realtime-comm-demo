namespace WebRealtimeCommDemo.Models;

/// <summary>
/// 表示一個請求以傳送訊息的資料結構。
/// </summary>
public class SendMessageRequest
{
    /// <summary>
    /// 訊息的內容。
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// 表示訊息的發送者名稱。
    /// 若未提供，則預設為 "Anonymous"。
    /// </summary>
    public string? Sender { get; set; }
}