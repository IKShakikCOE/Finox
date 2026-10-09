using Calendar.Domain;
using Calendar.Infrastructure.Persistence;
using Finox.Shared.Application;
using Finox.Shared.Infrastructure;
using Finox.Shared.Infrastructure.Crud;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Calendar.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCalendarInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<CalendarDbContext>(configuration);
        services.AddScoped<ICrudService<CalendarEvent>, CrudService<CalendarEvent, CalendarDbContext>>();
        return services;
    }
}
