using Microsoft.EntityFrameworkCore;
using Service_Rendez_vous.Data;
using Service_Rendez_vous.Repositories.Interfaces;
using Service_Rendez_vous.Repositories;
using Service_Rendez_vous.Services.Interfaces;
using Service_Rendez_vous.Services;
using Service_Rendez_vous.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// 🔥 Ajout DbContext PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// OpenAPI
builder.Services.AddScoped<IRendezVousRepository, RendezVousRepository>();
builder.Services.AddScoped<IRendezVousService, RendezVousService>();
builder.Services.AddOpenApi();

var app = builder.Build();

// Appliquer les migrations automatiquement au démarrage du conteneur
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Une erreur est survenue lors de la migration de la base de données.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();