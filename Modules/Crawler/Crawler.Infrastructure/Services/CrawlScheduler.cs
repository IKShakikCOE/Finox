using Crawler.Application;
using Microsoft.Extensions.Logging;

namespace Crawler.Infrastructure.Services;

public sealed class CrawlScheduler : ICrawlScheduler
{
    private readonly ILogger<CrawlScheduler> _logger;

    public CrawlScheduler(ILogger<CrawlScheduler> logger)
    {
        _logger = logger;
    }

    public void RegisterRecurring(string sourceId, TimeSpan interval)
    {
        _logger.LogInformation("Registered recurring schedule for source {SourceId} every {Interval}", sourceId, interval);
    }

    public void EnqueueOnDemand(string sourceId)
    {
        _logger.LogInformation("Enqueued on-demand crawl job for source {SourceId}", sourceId);
    }
}
