using Investment.Application;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Investment.Infrastructure.Services;

public sealed class InvestmentCrawlerBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<InvestmentCrawlerBackgroundService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(6);

    private DateTime _lastWeeklySweep = DateTime.MinValue;

    public InvestmentCrawlerBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<InvestmentCrawlerBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("InvestmentCrawlerBackgroundService initialized. Schedule: 4 times/day (every 6h), Weekly re-verification: every 7 days. Initial delay 5s...");

        // Initial delay to let server finish startup and DB migrations
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Executing automated scheduled Facebook Investment Crawl & Audit (Cycle: 4/day)...");

                using var scope = _serviceProvider.CreateScope();
                var orchestrator = scope.ServiceProvider.GetRequiredService<ICrawlerOrchestratorService>();

                // 1. Incremental crawl (adds only new ads, updates activity timestamps on existing ads)
                await orchestrator.RunCrawlAndInvestigatePipelineAsync(stoppingToken);

                // 2. Weekly Campaign Re-Verification (runs once every 7 days)
                if (DateTime.UtcNow - _lastWeeklySweep >= TimeSpan.FromDays(7))
                {
                    _logger.LogInformation("7 days elapsed since last sweep. Executing Weekly Facebook Ad Campaign Re-Verification...");
                    await orchestrator.VerifyActiveCampaignsWeeklyAsync(stoppingToken);
                    _lastWeeklySweep = DateTime.UtcNow;
                }

                _logger.LogInformation("Automated crawl cycle finished successfully.");
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during scheduled investment crawl cycle.");
            }

            try
            {
                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
