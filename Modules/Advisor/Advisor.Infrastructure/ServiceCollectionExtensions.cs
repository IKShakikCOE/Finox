using Advisor.Application;
using Advisor.Infrastructure.Persistence;
using Advisor.Infrastructure.Services;
using Finox.Shared.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Advisor.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAdvisorInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<AdvisorDbContext>(configuration);
        services.AddHttpClient<IAdvisorService, GeminiAdvisorService>();
        return services;
    }
}
