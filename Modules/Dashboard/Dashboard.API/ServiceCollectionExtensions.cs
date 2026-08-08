using Dashboard.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Dashboard.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDashboardModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDashboardInfrastructure(configuration);
        return services;
    }
}
