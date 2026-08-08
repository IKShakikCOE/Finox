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

var builder = WebApplication.CreateBuilder(args);

// Register Shared API & Infrastructure (CurrentUser, IIdGenerator, Controllers, JSON Options, Validation errors)
builder.Services.AddSharedApi(builder.Configuration);

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
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
