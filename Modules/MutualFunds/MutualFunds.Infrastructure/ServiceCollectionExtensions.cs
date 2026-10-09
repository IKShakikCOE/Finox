using Finox.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MutualFunds.Infrastructure.Persistence;

namespace MutualFunds.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMutualFundsInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<MutualFundsDbContext>(configuration);
        return services;
    }
}
