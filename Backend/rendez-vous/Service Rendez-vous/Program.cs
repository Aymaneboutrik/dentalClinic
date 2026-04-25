using Microsoft.EntityFrameworkCore;
using Service_Rendez_vous.Data;
using Service_Rendez_vous.Repositories.Interfaces;
using Service_Rendez_vous.Repositories;
using Service_Rendez_vous.Services.Interfaces;
using Service_Rendez_vous.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// 🔥 Ajout DbContext PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// OpenAPI
builder.Services.AddScoped<IRendezVousRepository, RendezVousRepository>();
builder.Services.AddScoped<IRendezVousService, RendezVousService>();
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();