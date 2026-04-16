using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using StockApi.Data;
using StockApi.Services;
using StockApi.Repositories.Interfaces;
using StockApi.Repositories.Implementations;
using System.Text.Json.Serialization;

// 🔹 Fix PostgreSQL DateTime UTC
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddOpenApi();

builder.Services.AddScoped<ICommandeRepository, CommandeRepository>();
builder.Services.AddScoped<IFournisseurRepository, FournisseurRepository>();
builder.Services.AddScoped<ILigneCommandeRepository, LigneCommandeRepository>();
builder.Services.AddScoped<IProduitRepository, ProduitRepository>();
builder.Services.AddScoped<IMouvementStockRepository, MouvementStockRepository>();
builder.Services.AddScoped<ISortieRepository, SortieRepository>();

builder.Services.AddScoped<ProduitService>();
builder.Services.AddScoped<SortieService>();
builder.Services.AddScoped<MouvementStockService>();
builder.Services.AddScoped<NotificationService>();

var app = builder.Build();

// Appliquer les migrations automatiquement au démarrage
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Gestionnaire d'exceptions global
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = feature?.Error;

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 500;

        await context.Response.WriteAsJsonAsync(new
        {
            message = exception?.Message ?? "Erreur interne serveur",
            status = 500
        });
    });
});

app.UseCors();
app.UseAuthorization();
app.MapControllers();
app.Run();