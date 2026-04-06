using Microsoft.EntityFrameworkCore;
using StockApi.Data;
using StockApi.Services;
using StockApi.Repositories.Interfaces;
using StockApi.Repositories.Implementations;

var builder = WebApplication.CreateBuilder(args);

// 🔹 DbContext PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("StockDb"));

// 🔹 Controllers
builder.Services.AddControllers();

// 🔹 Repositories
builder.Services.AddScoped<ICommandeRepository, CommandeRepository>();
builder.Services.AddScoped<IFournisseurRepository, FournisseurRepository>();
builder.Services.AddScoped<ILigneCommandeRepository, LigneCommandeRepository>();
builder.Services.AddScoped<IProduitRepository, ProduitRepository>();
builder.Services.AddScoped<IMouvementStockRepository, MouvementStockRepository>();
builder.Services.AddScoped<ISortieRepository, SortieRepository>();

// 🔹 Services
builder.Services.AddScoped<ProduitService>();
builder.Services.AddScoped<SortieService>();
builder.Services.AddScoped<MouvementStockService>();
builder.Services.AddScoped<NotificationService>();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();