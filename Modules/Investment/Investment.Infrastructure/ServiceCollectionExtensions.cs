using Finox.Shared.Application;
using Finox.Shared.Infrastructure;
using Finox.Shared.Infrastructure.Crud;
using Investment.Domain;
using Investment.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Investment.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInvestmentInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<InvestmentDbContext>(configuration);
        services.AddScoped<ICrudService<Campaign>, CrudService<Campaign, InvestmentDbContext>>();
        return services;
    }
}
