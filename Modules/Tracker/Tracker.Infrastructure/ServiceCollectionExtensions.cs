using Finox.Shared.Application;
using Finox.Shared.Infrastructure;
using Tracker.Application;
using Tracker.Domain;
using Tracker.Infrastructure.Persistence;
using Tracker.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Tracker.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTrackerInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddModuleDbContext<TrackerDbContext>(configuration);

        services.AddScoped<TransactionService>();
        services.AddScoped<ITransactionService>(sp => sp.GetRequiredService<TransactionService>());
        services.AddScoped<ICrudService<Transaction>>(sp => sp.GetRequiredService<TransactionService>());

        services.AddScoped<CategoryService>();
        services.AddScoped<ICategoryService>(sp => sp.GetRequiredService<CategoryService>());
        services.AddScoped<ICrudService<Category>>(sp => sp.GetRequiredService<CategoryService>());

        services.AddScoped<ICrudService<Account>, AccountService>();
        services.AddScoped<ICrudService<Budget>, Finox.Shared.Infrastructure.Crud.CrudService<Budget, TrackerDbContext>>();
        services.AddScoped<ICrudService<Goal>, Finox.Shared.Infrastructure.Crud.CrudService<Goal, TrackerDbContext>>();
        services.AddScoped<ICrudService<GoalTransaction>, Finox.Shared.Infrastructure.Crud.CrudService<GoalTransaction, TrackerDbContext>>();
        services.AddScoped<ICrudService<Subscription>, Finox.Shared.Infrastructure.Crud.CrudService<Subscription, TrackerDbContext>>();
        services.AddScoped<ICrudService<SubscriptionPaymentHistory>, Finox.Shared.Infrastructure.Crud.CrudService<SubscriptionPaymentHistory, TrackerDbContext>>();
        services.AddScoped<ICrudService<RecurringRule>, Finox.Shared.Infrastructure.Crud.CrudService<RecurringRule, TrackerDbContext>>();

        return services;
    }
}
