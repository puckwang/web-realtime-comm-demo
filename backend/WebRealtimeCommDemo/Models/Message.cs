namespace WebRealtimeCommDemo.Models;

/// <summary>
/// 表示一則訊息的資料結構。
/// </summary>
public class Message
{
    /// <summary>
    /// 獨一無二的識別碼，用於唯一標識每個訊息實體。
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// 表示訊息的內容。
    /// </summary>
    /// <remarks>
    /// 此屬性用於儲存訊息的主要文字內容，通常是在訊息傳輸過程中最重要的部分。
    /// 預設值為空字串，且不可為 null。
    /// </remarks>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// 代表訊息的發送者名稱。
    /// </summary>
    /// <remarks>
    /// 此屬性用於標識發送訊息的使用者或來源。
    /// 預設值為空字串，若未指定則可能顯示為系統預設名稱（如 "Anonymous"）。
    /// </remarks>
    public string Sender { get; set; } = string.Empty;

    /// <summary>
    /// 表示訊息的時間戳記。
    /// 此屬性存取或設定訊息產生的精確時間，通常以協調世界時間 (UTC) 為單位。
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }
}