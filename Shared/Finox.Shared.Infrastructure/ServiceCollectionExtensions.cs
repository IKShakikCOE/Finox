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
        var connectionString = configuration.GetConnectionString(connectionStringName);

        services.AddDbContext<TContext>(options =>
        {
            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                options.UseNpgsql(connectionString);
            }
        });

        return services;
    }
}
