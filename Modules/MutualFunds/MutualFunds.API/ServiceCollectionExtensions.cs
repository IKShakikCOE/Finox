using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MutualFunds.Infrastructure;

namespace MutualFunds.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMutualFundsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMutualFundsInfrastructure(configuration);
        return services;
    }
}
