using System.Collections.Concurrent;
using WebRealtimeCommDemo.Models;

namespace WebRealtimeCommDemo.Services;

public class MessagesService
{
    /// <summary>
    /// 儲存所有訊息的集合。
    /// </summary>
    private readonly ConcurrentBag<Message> _messages = new();
    
    /// <summary>
    /// 用於保護事件觸發的鎖定物件
    /// </summary>
    private readonly object _eventLock = new();
    
    /// <summary>
    /// 新訊息事件，當有新訊息時觸發
    /// </summary>
    public event EventHandler? NewMessageReceived;

    /// <summary>
    /// 傳送一則訊息至訊息集合中，並返回該訊息的詳細資料。
    /// </summary>
    /// <param name="content">訊息的內容。</param>
    /// <param name="sender">訊息的發送者名稱（預設為 "Anonymous"）。</param>
    /// <returns>包含已傳送訊息詳細資料的物件。</returns>
    public Message SendMessage(string content, string sender = "Anonymous")
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("訊息內容不能為空", nameof(content));
        
        if (string.IsNullOrWhiteSpace(sender))
            sender = "Anonymous";

        var message = new Message
        {
            Id = Guid.NewGuid(),
            Content = content,
            Sender = sender,
            Timestamp = DateTimeOffset.UtcNow
        };

        _messages.Add(message);
        
        // 使用鎖定確保事件觸發的 thread safety
        lock (_eventLock)
        {
            NewMessageReceived?.Invoke(this, EventArgs.Empty);
        }

        return message;
    }

    /// <summary>
    /// 根據指定的時間點，取得自該時間點之後的所有訊息。
    /// </summary>
    /// <param name="since">要篩選的起始時間點。</param>
    /// <returns>一個包含所有自指定時間點以後的訊息之清單。</returns>
    public IList<Message> GetMessages(DateTimeOffset since)
    {
        // ConcurrentBag 的枚舉操作是 thread-safe 的
        return _messages
            .Where(m => m.Timestamp > since)
            .OrderBy(m => m.Timestamp)
            .ToList();
    }
}