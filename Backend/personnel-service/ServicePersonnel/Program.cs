using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Service_Personnel.Data;
using Service_Personnel.Exceptions;
using Service_Personnel.Repositories.DemandesAbsence;
using Service_Personnel.Repositories.Horaires;
using Service_Personnel.Repositories.Interfaces.DemandesAbsence;
using Service_Personnel.Repositories.Interfaces.Employees;
using Service_Personnel.Repositories.Interfaces.Horaires;
using Service_Personnel.Services.DemandeAbsence;
using Service_Personnel.Services.Employees;
using Service_Personnel.Services.Horaires;
using Service_Personnel.Services.Interfaces.DemandeAbsence;
using System.Text.Json.Serialization;
using Service_Personnel.Repositories.Absences;
using Service_Personnel.Repositories.Interfaces.Absences;
using Service_Personnel.Services.Absences;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options => //quand quelqu’un demande AppDbContext, connecte-toi à PostgreSQL avec Default !!
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

///////////////////////////////////////////////////////
builder.Services.AddScoped<IHoraireRepository, HoraireRepository>();
builder.Services.AddScoped<IHoraireService, HoraireService>();

///////////////////////////////////////////////////////////////////////
///
builder.Services.AddScoped<IDemandeAbsenceRepository, DemandeAbsenceRepository>();
builder.Services.AddScoped<IDemandeAbsenceService, DemandeAbsenceService>();
//////////////////////////////////////////////////////////////////////////
builder.Services.AddScoped<IAbsenceRepository, AbsenceRepository>();
/////////////////////////////////////////////////////////////////

builder.Services.AddScoped<IAbsenceRepository, AbsenceRepository>();
builder.Services.AddScoped<IAbsenceService, AbsenceService>();
/////////////////////////////////////////////////////////////////
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseHttpsRedirection();

app.UseAuthorization();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = feature?.Error;

        context.Response.ContentType = "application/json";

        if (exception is ApiException apiEx)
        {
            context.Response.StatusCode = apiEx.StatusCode; //Le middleware fabrique la réponse HTTP

            await context.Response.WriteAsJsonAsync(new //prend l’objet C# et le convertit automatiquement en JSON
            {
                message = apiEx.Message,
                code = apiEx.ErrorCode,
                status = apiEx.StatusCode
            });

            return;
        }

        context.Response.StatusCode = 500;

        await context.Response.WriteAsJsonAsync(new
        {
            message = "Erreur interne serveur",
            status = 500
        });
    });
});

app.MapControllers();

app.Run();
