using Scalar.AspNetCore;
using WebRealtimeCommDemo.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOpenApi()
    .AddSingleton<MessagesService>()
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
app.Run();
