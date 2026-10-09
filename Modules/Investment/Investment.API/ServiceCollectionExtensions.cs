using Investment.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Investment.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInvestmentModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddInvestmentInfrastructure(configuration);
        return services;
    }
}
