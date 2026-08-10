using Insurance.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Insurance.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInsuranceModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddInsuranceInfrastructure(configuration);
        return services;
    }
}
