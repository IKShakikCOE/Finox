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
    .AddApplicationPart(typeof(Bank.API.Controllers.BankController).Assembly)
    .AddApplicationPart(typeof(Insurance.API.Controllers.InsuranceController).Assembly)
    .AddApplicationPart(typeof(MutualFunds.API.Controllers.MutualFundsController).Assembly)
    .AddApplicationPart(typeof(News.API.Controllers.NewsController).Assembly)
    .AddApplicationPart(typeof(Identity.API.Controllers.UserController).Assembly)
    .AddApplicationPart(typeof(Investment.API.Controllers.InvestmentController).Assembly)
    .AddApplicationPart(typeof(Calendar.API.Controllers.CalendarController).Assembly)
    .AddApplicationPart(typeof(Messaging.API.Controllers.MessagesController).Assembly)
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

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
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

    // Ensure database tables exist for all module DbContexts in PostgreSQL.
    // Uses GenerateCreateScript() per DbContext, split into individual statements,
    // executing each separately so that already-existing tables are safely skipped.
    using var scope = app.Services.CreateScope();
    var sp = scope.ServiceProvider;

    DbContext[] dbContexts = [
        sp.GetRequiredService<Tracker.Infrastructure.Persistence.TrackerDbContext>(),
        sp.GetRequiredService<Bank.Infrastructure.Persistence.BankDbContext>(),
        sp.GetRequiredService<Insurance.Infrastructure.Persistence.InsuranceDbContext>(),
        sp.GetRequiredService<MutualFunds.Infrastructure.Persistence.MutualFundsDbContext>(),
        sp.GetRequiredService<News.Infrastructure.Persistence.NewsDbContext>(),
        sp.GetRequiredService<Identity.Infrastructure.Persistence.IdentityDbContext>(),
        sp.GetRequiredService<Investment.Infrastructure.Persistence.InvestmentDbContext>(),
        sp.GetRequiredService<Calendar.Infrastructure.Persistence.CalendarDbContext>(),
        sp.GetRequiredService<Messaging.Infrastructure.Persistence.MessagingDbContext>(),
        sp.GetRequiredService<Advisor.Infrastructure.Persistence.AdvisorDbContext>(),
        sp.GetRequiredService<Crawler.Infrastructure.Persistence.CrawlerDbContext>()
    ];

    // Ensure the database itself exists
    {
        var creator0 = (IRelationalDatabaseCreator)dbContexts[0].Database.GetService<IDatabaseCreator>();
        if (!await creator0.ExistsAsync())
        {
            await creator0.CreateAsync();
        }
    }

    // Detect old PascalCase column schema and drop ALL public tables if found.
    // This handles the one-time migration from PascalCase to snake_case columns.
    {
        var conn = dbContexts[0].Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open)
            await conn.OpenAsync();

        using var checkCmd = conn.CreateCommand();
        checkCmd.CommandText = "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'Id');";
        var hasPascalCaseColumns = (bool?)(await checkCmd.ExecuteScalarAsync()) ?? false;

        if (hasPascalCaseColumns)
        {
            Console.WriteLine("Detected old PascalCase column schema. Dropping all tables for snake_case migration...");
            using var dropCmd = conn.CreateCommand();
            dropCmd.CommandText = @"
                DO $$ DECLARE r RECORD;
                BEGIN
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ""' || r.tablename || '"" CASCADE';
                    END LOOP;
                END $$;";
            await dropCmd.ExecuteNonQueryAsync();
        }
    }

    // For each DbContext, generate the full creation script, split it into individual
    // statements, and execute each one. If a statement fails (table already exists), skip it.
    foreach (var db in dbContexts)
    {
        try
        {
            var creator = (IRelationalDatabaseCreator)db.Database.GetService<IDatabaseCreator>();
            var script = creator.GenerateCreateScript();

            // Split the script into individual statements by semicolons
            var statements = script.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            var conn = db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            foreach (var stmt in statements)
            {
                if (string.IsNullOrWhiteSpace(stmt)) continue;
                try
                {
                    using var cmd = conn.CreateCommand();
                    cmd.CommandText = stmt;
                    await cmd.ExecuteNonQueryAsync();
                }
                catch
                {
                    // Table/constraint already exists, skip
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Module DB Init ({db.GetType().Name}): {ex.Message}");
        }
    }

    try
    {
        var bankDb = sp.GetRequiredService<Bank.Infrastructure.Persistence.BankDbContext>();
        await Bank.Infrastructure.Persistence.BankSeeder.SeedAsync(bankDb);

        var insuranceDb = sp.GetRequiredService<Insurance.Infrastructure.Persistence.InsuranceDbContext>();
        await Insurance.Infrastructure.Persistence.InsuranceSeeder.SeedAsync(insuranceDb);

        var mutualFundsDb = sp.GetRequiredService<MutualFunds.Infrastructure.Persistence.MutualFundsDbContext>();
        await MutualFunds.Infrastructure.Persistence.MutualFundsSeeder.SeedAsync(mutualFundsDb);

        var newsDb = sp.GetRequiredService<News.Infrastructure.Persistence.NewsDbContext>();
        await News.Infrastructure.Persistence.NewsSeeder.SeedAsync(newsDb);

        var trackerDb = sp.GetRequiredService<Tracker.Infrastructure.Persistence.TrackerDbContext>();
        await Tracker.Infrastructure.Persistence.TrackerSeeder.SeedAsync(trackerDb);

        var investmentDb = sp.GetRequiredService<Investment.Infrastructure.Persistence.InvestmentDbContext>();
        await Investment.Infrastructure.Persistence.InvestmentSeeder.SeedAsync(investmentDb);

        var calendarDb = sp.GetRequiredService<Calendar.Infrastructure.Persistence.CalendarDbContext>();
        await Calendar.Infrastructure.Persistence.CalendarSeeder.SeedAsync(calendarDb);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Seeding error: {ex.Message}");
    }
}

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
