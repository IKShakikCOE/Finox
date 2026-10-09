using Finox.Shared.Application;
using Finox.Shared.Infrastructure;
using Finox.Shared.Infrastructure.Crud;
using Investment.Application;
using Investment.Domain;
using Investment.Infrastructure.Persistence;
using Investment.Infrastructure.Services;
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
        services.AddHttpClient<IInvestmentAuditService, InvestmentAuditService>();
        services.AddScoped<IInvestmentAuditService, InvestmentAuditService>();

        services.AddHttpClient<IFacebookAdCrawlerService, FacebookAdCrawlerService>();
        services.AddScoped<IFacebookAdCrawlerService, FacebookAdCrawlerService>();

        services.AddHttpClient<IDeepInvestigatorService, DeepInvestigatorService>();
        services.AddScoped<IDeepInvestigatorService, DeepInvestigatorService>();

        services.AddScoped<ICrawlerOrchestratorService, CrawlerOrchestratorService>();
        services.AddHostedService<InvestmentCrawlerBackgroundService>();
        return services;
    }
}
