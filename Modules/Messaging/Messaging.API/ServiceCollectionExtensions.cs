using Messaging.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Messaging.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMessagingModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMessagingInfrastructure(configuration);
        return services;
    }
}
