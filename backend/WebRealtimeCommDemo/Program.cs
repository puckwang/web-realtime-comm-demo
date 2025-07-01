using Scalar.AspNetCore;
using WebRealtimeCommDemo.Demos.SignalR;
using WebRealtimeCommDemo.Services;
using WebRealtimeCommDemo.Demos.WebSocket;
using WebRealtimeCommDemo.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    // .AddOpenApi()
    .AddSingleton<MessagesService>()
    .AddSingleton<MessagesWebSocketManager>()
    .AddControllers();
builder.Services.AddSignalR();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference();
}

app.UseCorsFromEnv();
// app.MapOpenApi();
app.MapControllers();
app.UseMessagesWebSocket();
app.MapHub<MessagesHub>("/Hubs/Messages");
app.Run();
