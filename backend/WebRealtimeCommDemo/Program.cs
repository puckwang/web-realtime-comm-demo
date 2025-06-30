using Scalar.AspNetCore;
using WebRealtimeCommDemo.Services;
using WebRealtimeCommDemo.Demos.WebSocket;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOpenApi()
    .AddSingleton<MessagesService>()
    .AddSingleton<MessagesWebSocketManager>()
    .AddControllers();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference();
    app.UseCors(o => o
        .WithOrigins("http://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()
    );
}

app.MapOpenApi();
app.MapControllers();
app.UseMessagesWebSocket();
app.Run();
