using Tracker.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Tracker.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTrackerModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddTrackerInfrastructure(configuration);

        return services;
    }
}
