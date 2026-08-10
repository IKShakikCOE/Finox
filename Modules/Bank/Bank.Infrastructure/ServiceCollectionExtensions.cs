using Bank.Infrastructure.Persistence;
using Finox.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Bank.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBankInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<BankDbContext>(configuration);
        return services;
    }
}
