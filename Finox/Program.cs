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
        sp.GetRequiredService<Advisor.Infrastructure.Persistence.AdvisorDbContext>(),
        sp.GetRequiredService<Crawler.Infrastructure.Persistence.CrawlerDbContext>()
    ];

    // Ensure the database itself exists
    try
    {
        var creator0 = (IRelationalDatabaseCreator)dbContexts[0].Database.GetService<IDatabaseCreator>();
        if (!await creator0.ExistsAsync())
        {
            await creator0.CreateAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization check: {ex.Message}");
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

    // Ensure incremental schema columns exist for investment_leads
    try
    {
        var investmentDb = sp.GetRequiredService<Investment.Infrastructure.Persistence.InvestmentDbContext>();
        var conn = investmentDb.Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open)
        {
            await conn.OpenAsync();
        }

        using var alterCmd = conn.CreateCommand();
        alterCmd.CommandText = @"
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS facebook_page_id text;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS facebook_ad_id text;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS facebook_ad_url text;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS external_website_url text;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS app_package_name text;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS domain_whois_summary text;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS app_store_package_summary text;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS reputation_search_summary text;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS deep_investigation_report_markdown text;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS last_deep_investigated_at timestamp with time zone;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS is_campaign_active boolean DEFAULT true;
            ALTER TABLE IF EXISTS investment_leads ADD COLUMN IF NOT EXISTS last_verified_active_at timestamp with time zone;

            -- Auto-backfill facebook_ad_url for existing rows with clean sector query
            UPDATE investment_leads
            SET facebook_ad_url = CASE
                WHEN facebook_ad_id ~ '^[0-9]+$' THEN 'https://www.facebook.com/ads/library/?id=' || facebook_ad_id
                WHEN company_name LIKE '%কার%' OR company_name LIKE '%ড্রাইভ%' OR company_name LIKE '%শো-রুম%' THEN 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%95%E0%A6%BE%E0%A6%B0+%E0%A6%B6%E0%A7%8B-%E0%A6%B0%E0%A7%81%E0%A6%AE'
                WHEN company_name LIKE '%এগ্রো%' OR company_name LIKE '%ফার্ম%' OR company_name LIKE '%খামার%' THEN 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%8F%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A7%8B+%E0%A6%96%E0%A6%BE%E0%A6%AE%E0%A6%BE%E0%A6%B0'
                WHEN company_name LIKE '%মাছ%' OR company_name LIKE '%ফিশ%' THEN 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%AE%E0%A6%BE%E0%A6%9B+%E0%A6%9A%E0%A6%BE%E0%A6%B7'
                WHEN company_name LIKE '%ফরেক্স%' OR company_name LIKE '%ট্রেডিং%' OR company_name LIKE '%ট্রেডার্স%' THEN 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%AB%E0%A6%B0%E0%A7%87%E0%A6%95%E0%A7%8D%E0%A6%B8+%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%A1%E0%A6%BF%E0%A6%82'
                WHEN company_name LIKE '%হোটেল%' OR company_name LIKE '%রিসোর্ট%' THEN 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%B9%E0%A7%8B%E0%A6%9F%E0%A7%87%E0%A6%B2+%E0%A6%B0%E0%A6%BF%E0%A6%B8%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%9F'
                WHEN company_name LIKE '%ই-কমার্স%' OR company_name LIKE '%লজিস্টিকস%' THEN 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%87-%E0%A6%95%E0%A6%AE%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%B8'
                WHEN company_name LIKE '%সোলার%' OR company_name LIKE '%বিদ্যুৎ%' THEN 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%B8%E0%A7%8B%E0%A6%B2%E0%A6%BE%E0%A6%B0+%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%9C%E0%A7%87%E0%A6%95%E0%A7%8D%E0%A6%9F'
                WHEN company_name LIKE '%পোল্ট্রি%' OR company_name LIKE '%মুরগি%' THEN 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%AA%E0%A7%8B%E0%A6%B2%E0%A7%8D%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BF+%E0%A6%96%E0%A6%BE%E0%A6%AE%E0%A6%BE%E0%A6%B0'
                WHEN company_name LIKE '%গোল্ড%' THEN 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%97%E0%A7%8B%E0%A6%B2%E0%A7%8D%E0%A6%A1'
                ELSE 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=%E0%A6%AC%E0%A6%BF%E0%A6%A8%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A7%8B%E0%A6%97'
            END
            WHERE facebook_ad_url IS NULL OR facebook_ad_url = '' OR facebook_ad_url LIKE '%+শো-রুম%' OR length(facebook_ad_url) > 150;
        ";
        await alterCmd.ExecuteNonQueryAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Investment schema migration error: {ex.Message}");
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
