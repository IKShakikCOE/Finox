using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using News.Infrastructure;

namespace News.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddNewsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddNewsInfrastructure(configuration);
        return services;
    }
}
