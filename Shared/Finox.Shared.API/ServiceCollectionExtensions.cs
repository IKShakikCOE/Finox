using Finox.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Finox.Shared.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSharedApi(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedInfrastructure(configuration);
        return services;
    }
}
