using Calendar.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Calendar.API;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCalendarModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddCalendarInfrastructure(configuration);
        return services;
    }
}
