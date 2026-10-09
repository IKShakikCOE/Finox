using Finox.Shared.Domain;
using Finox.Shared.Infrastructure.Crud;
using Finox.Shared.Infrastructure.Errors;
using Finox.Shared.Infrastructure.Identity;
using Finox.Shared.Infrastructure.Json;
using Finox.Shared.Application;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Finox.Shared.Infrastructure;

/// <summary>
/// Composition root for the shared infrastructure. Registers cross-cutting services
/// (current user, id generator, JSON conventions, error handling) used by all modules.
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSharedInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddSingleton<IIdGenerator, GuidIdGenerator>();

        services
            .AddControllers()
            .AddJsonOptions(options => FinoxJsonOptions.Apply(options.JsonSerializerOptions));

        // Emit the standard ErrorResponse shape for model-validation failures instead of ProblemDetails.
        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = ValidationErrorFactory.Produce;
        });

        return services;
    }

    /// <summary>
    /// Helper to register a module's <see cref="DbContext"/> with PostgreSQL.
    /// Each module calls this in its own AddXxxModule extension.
    /// </summary>
    public static IServiceCollection AddModuleDbContext<TContext>(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionStringName = "FinoxDatabase")
        where TContext : DbContext
    {
        var rawConnectionString = configuration.GetConnectionString(connectionStringName);

        if (string.IsNullOrWhiteSpace(rawConnectionString))
        {
            throw new InvalidOperationException($"Connection string '{connectionStringName}' was not found or is empty.");
        }

        var connectionString = NormalizePostgresConnectionString(rawConnectionString);

        services.AddDbContext<TContext>(options =>
        {
            options.UseNpgsql(connectionString)
                   .UseSnakeCaseNamingConvention();
        });

        return services;
    }

    /// <summary>
    /// Normalizes PostgreSQL connection string. If given a URI (postgresql:// or postgres://),
    /// converts it to ADO.NET key-value pair format with SSL enabled for cloud databases.
    /// Also strips wrapping quotes or whitespace.
    /// </summary>
    public static string NormalizePostgresConnectionString(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString)) return connectionString;
        connectionString = connectionString.Trim().Trim('"', '\'');

        if (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(connectionString);
                var userInfo = uri.UserInfo.Split(':');
                var username = Uri.UnescapeDataString(userInfo[0]);
                var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;
                var database = uri.AbsolutePath.TrimStart('/');

                var builder = new Npgsql.NpgsqlConnectionStringBuilder
                {
                    Host = host,
                    Port = port,
                    Database = string.IsNullOrWhiteSpace(database) ? "postgres" : database,
                    Username = username,
                    Password = password,
                    SslMode = Npgsql.SslMode.Require,
                    TrustServerCertificate = true
                };
                return builder.ConnectionString;
            }
            catch
            {
                // Fall back to original if URI parsing fails
            }
        }

        return connectionString;
    }
}
