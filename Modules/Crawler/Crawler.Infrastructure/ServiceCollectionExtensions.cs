using Crawler.Application;
using Crawler.Infrastructure.Persistence;
using Crawler.Infrastructure.Services;
using Finox.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Crawler.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCrawlerInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<CrawlerDbContext>(configuration);
        services.AddSingleton<ICrawlScheduler, CrawlScheduler>();
        return services;
    }
}
