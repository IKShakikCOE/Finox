using Finox.Shared.Infrastructure;
using Insurance.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Insurance.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInsuranceInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<InsuranceDbContext>(configuration);
        return services;
    }
}
