using Finox.Shared.Infrastructure;
using Identity.Domain;
using Identity.Infrastructure.Persistence;
using Identity.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddIdentityInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<IdentityDbContext>(configuration);

        services.Configure<KeycloakOptions>(
            configuration.GetSection(KeycloakOptions.SectionName));

        services.AddHttpClient<IKeycloakAdminClient, KeycloakAdminClient>();

        return services;
    }
}
