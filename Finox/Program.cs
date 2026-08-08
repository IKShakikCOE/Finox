using Finox.Shared.API;
using Finox.Shared.Infrastructure.Auth;
using Finox.Shared.Infrastructure.Errors;
using Tracker.API;
using Catalog.API;
using Identity.API;
using Investment.API;
using Calendar.API;
using Messaging.API;
using Advisor.API;
using Dashboard.API;
using Crawler.API;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

var builder = WebApplication.CreateBuilder(args);

// Register Shared API & Infrastructure (CurrentUser, IIdGenerator, Controllers, JSON Options, Validation errors)
builder.Services.AddSharedApi(builder.Configuration);

// Register Controllers Application Parts for all feature modules (Modular Monolith controller discovery)
builder.Services.AddControllers()
    .AddApplicationPart(typeof(Tracker.API.Controllers.TransactionsController).Assembly)
    .AddApplicationPart(typeof(Catalog.API.Controllers.BankController).Assembly)
    .AddApplicationPart(typeof(Identity.API.Controllers.UserController).Assembly)
    .AddApplicationPart(typeof(Investment.API.Controllers.InvestmentController).Assembly)
    .AddApplicationPart(typeof(Calendar.API.Controllers.CalendarController).Assembly)
    .AddApplicationPart(typeof(Messaging.API.Controllers.MessagesController).Assembly)
    .AddApplicationPart(typeof(Advisor.API.Controllers.AdvisorController).Assembly)
    .AddApplicationPart(typeof(Dashboard.API.Controllers.DashboardController).Assembly)
    .AddApplicationPart(typeof(Crawler.API.Controllers.CrawlerController).Assembly);

// Register Feature Modules (SmartFM Modular Monolith pattern)
builder.Services.AddTrackerModule(builder.Configuration);
builder.Services.AddCatalogModule(builder.Configuration);
builder.Services.AddIdentityModule(builder.Configuration);
builder.Services.AddInvestmentModule(builder.Configuration);
builder.Services.AddCalendarModule(builder.Configuration);
builder.Services.AddMessagingModule(builder.Configuration);
builder.Services.AddAdvisorModule(builder.Configuration);
builder.Services.AddDashboardModule(builder.Configuration);
builder.Services.AddCrawlerModule(builder.Configuration);

// JWT Authentication & Authorization
var keycloakSection = builder.Configuration.GetSection("Keycloak");
if (keycloakSection.Exists() && !string.IsNullOrWhiteSpace(keycloakSection["BaseUrl"]))
{
    var authority = $"{keycloakSection["BaseUrl"]?.TrimEnd('/')}/realms/{keycloakSection["Realm"] ?? "finox"}";
    var requireHttps = bool.TryParse(keycloakSection["RequireHttpsMetadata"], out var https) && https;
    var audience = keycloakSection["Audience"];

    builder.Services.AddFinoxAuthentication(authority, requireHttps, audience);
}

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Exception handling middleware (maps ApiException to standard error shape)
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Ensure database tables exist for all module DbContexts in PostgreSQL
    using var scope = app.Services.CreateScope();
    var sp = scope.ServiceProvider;

    DbContext[] dbContexts = [
        sp.GetRequiredService<Tracker.Infrastructure.Persistence.TrackerDbContext>(),
        sp.GetRequiredService<Catalog.Infrastructure.Persistence.CatalogDbContext>(),
        sp.GetRequiredService<Identity.Infrastructure.Persistence.IdentityDbContext>(),
        sp.GetRequiredService<Investment.Infrastructure.Persistence.InvestmentDbContext>(),
        sp.GetRequiredService<Calendar.Infrastructure.Persistence.CalendarDbContext>(),
        sp.GetRequiredService<Messaging.Infrastructure.Persistence.MessagingDbContext>(),
        sp.GetRequiredService<Advisor.Infrastructure.Persistence.AdvisorDbContext>(),
        sp.GetRequiredService<Crawler.Infrastructure.Persistence.CrawlerDbContext>()
    ];

    foreach (var db in dbContexts)
    {
        try
        {
            var creator = (IRelationalDatabaseCreator)db.Database.GetService<IDatabaseCreator>();
            if (!creator.Exists())
            {
                creator.Create();
            }
            if (!creator.HasTables())
            {
                creator.CreateTables();
            }
        }
        catch
        {
            // Table already exists or skipped
        }
    }
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
