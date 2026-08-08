using Finox.Shared.Infrastructure;
using Messaging.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Messaging.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMessagingInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<MessagingDbContext>(configuration);
        return services;
    }
}
