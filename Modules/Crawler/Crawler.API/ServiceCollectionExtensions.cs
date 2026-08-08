using Crawler.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Crawler.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCrawlerModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddCrawlerInfrastructure(configuration);
        return services;
    }
}
