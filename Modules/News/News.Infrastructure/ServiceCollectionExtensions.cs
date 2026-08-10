using Finox.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using News.Infrastructure.Persistence;

namespace News.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddNewsInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<NewsDbContext>(configuration);
        return services;
    }
}
