using System.Text.Json;

namespace WebRealtimeCommDemo.Utils;

public static class JsonUtils
{
    /// <summary>
    /// 將物件序列化為 JSON 字串。
    /// </summary>
    /// <param name="obj">要序列化的物件。</param>
    /// <returns>序列化後的 JSON 字串。</returns>
    public static string Serialize(object obj)
    {
        return JsonSerializer.Serialize(obj, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
    }

    /// <summary>
    /// 將 JSON 字串反序列化為指定類型的物件。
    /// </summary>
    /// <typeparam name="T">要反序列化的目標類型。</typeparam>
    /// <param name="json">要反序列化的 JSON 字串。</param>
    /// <returns>反序列化後的物件。</returns>
    public static T Deserialize<T>(string json)
    {
        return JsonSerializer.Deserialize<T>(
                   json,
                   new JsonSerializerOptions
                   {
                       PropertyNameCaseInsensitive = true
                   }
               )
               ?? throw new InvalidOperationException("反序列化失敗");
    }
}