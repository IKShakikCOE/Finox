using Finox.Extensions;
using Finox.Shared.API;
using Finox.Shared.Infrastructure.Auth;
using Finox.Shared.Infrastructure.Errors;
using Tracker.API;
using Bank.API;
using Insurance.API;
using MutualFunds.API;
using News.API;
using Identity.API;
using Investment.API;
using Calendar.API;
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
    .AddApplicationPart(typeof(Bank.API.Controllers.BankController).Assembly)
    .AddApplicationPart(typeof(Insurance.API.Controllers.InsuranceController).Assembly)
    .AddApplicationPart(typeof(MutualFunds.API.Controllers.MutualFundsController).Assembly)
    .AddApplicationPart(typeof(News.API.Controllers.NewsController).Assembly)
    .AddApplicationPart(typeof(Identity.API.Controllers.UserController).Assembly)
    .AddApplicationPart(typeof(Investment.API.Controllers.InvestmentController).Assembly)
    .AddApplicationPart(typeof(Calendar.API.Controllers.CalendarController).Assembly)
    .AddApplicationPart(typeof(Advisor.API.Controllers.AdvisorController).Assembly)
    .AddApplicationPart(typeof(Dashboard.API.Controllers.DashboardController).Assembly)
    .AddApplicationPart(typeof(Crawler.API.Controllers.CrawlerController).Assembly);

// Register Feature Modules (SmartFM Modular Monolith pattern)
builder.Services.AddTrackerModule(builder.Configuration);
builder.Services.AddBankModule(builder.Configuration);
builder.Services.AddInsuranceModule(builder.Configuration);
builder.Services.AddMutualFundsModule(builder.Configuration);
builder.Services.AddNewsModule(builder.Configuration);
builder.Services.AddIdentityModule(builder.Configuration);
builder.Services.AddInvestmentModule(builder.Configuration);
builder.Services.AddCalendarModule(builder.Configuration);
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

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "Enter JWT Bearer token like: Bearer {your_token}",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Exception handling middleware (maps ApiException to standard error shape)
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    await app.InitializeDatabasesAsync();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
