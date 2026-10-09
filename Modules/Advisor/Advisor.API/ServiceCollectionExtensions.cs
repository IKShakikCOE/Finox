using Advisor.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Advisor.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAdvisorModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddAdvisorInfrastructure(configuration);
        return services;
    }
}
