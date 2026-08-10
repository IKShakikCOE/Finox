using Bank.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Bank.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBankModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddBankInfrastructure(configuration);
        return services;
    }
}
