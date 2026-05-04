using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using StockApi.Data;
using StockApi.Services;
using StockApi.Repositories.Interfaces;
using StockApi.Repositories.Implementations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

// 🔹 Fix PostgreSQL DateTime UTC
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Configurer l'authentification JWT
var jwtSecret = builder.Configuration["JWT_SECRET"] ?? "dGhpcy1pcy1hLXZlcnktc2VjcmV0LWtleS10aGF0LWlzLWxvbmctZW5vdWdoLTI1NmJpdHM=";
var key = Convert.FromBase64String(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
    };
});

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

builder.Services.AddScoped<IFournisseurRepository, FournisseurRepository>();
builder.Services.AddScoped<ICommandeRepository, CommandeRepository>();
builder.Services.AddScoped<ILigneCommandeRepository, LigneCommandeRepository>();
builder.Services.AddScoped<IProduitRepository, ProduitRepository>();
builder.Services.AddScoped<IMouvementStockRepository, MouvementStockRepository>();
builder.Services.AddScoped<ICommandeValidationRepository, CommandeValidationRepository>();

builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<ProduitService>();
builder.Services.AddScoped<MouvementStockService>();

var app = builder.Build();

// Appliquer les migrations automatiquement au démarrage
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Keep existing Docker volume schema compatible with the API model.
    // The init.sql uses CREATE TABLE IF NOT EXISTS, so older volumes might miss newer columns.
    db.Database.ExecuteSqlRaw("""
        ALTER TABLE IF EXISTS produit
        ADD COLUMN IF NOT EXISTS actif boolean NOT NULL DEFAULT FALSE;
        """);

    db.Database.ExecuteSqlRaw("""
        ALTER TABLE IF EXISTS commande
        ADD COLUMN IF NOT EXISTS fournisseur_id integer NOT NULL DEFAULT 0;
        """);

    db.Database.ExecuteSqlRaw("""
        ALTER TABLE IF EXISTS ligne_commande
        ADD COLUMN IF NOT EXISTS produit_id integer NOT NULL DEFAULT 0;
        """);

    db.Database.ExecuteSqlRaw("""
        ALTER TABLE IF EXISTS ligne_commande
        ALTER COLUMN nom SET DEFAULT '';
        """);

    // Older Docker volumes might miss nullable FK columns on mouvement_stock.
    db.Database.ExecuteSqlRaw("""
        ALTER TABLE IF EXISTS mouvement_stock
        ADD COLUMN IF NOT EXISTS ligne_commande_id integer NULL;
        """);

    try
    {
        db.Database.Migrate();
    }
    catch (InvalidOperationException ex) when (ex.Message.Contains("PendingModelChangesWarning"))
    {
        // Do not crash the service if EF detects pending model changes.
        // This keeps the API available against the existing database schema.
        app.Logger.LogWarning(ex, "Skipping database migrations due to pending model changes.");
    }
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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();