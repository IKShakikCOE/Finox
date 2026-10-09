using Crawler.Domain;

namespace Crawler.Application;

public interface ICrawlScheduler
{
    void RegisterRecurring(string sourceId, TimeSpan interval);
    void EnqueueOnDemand(string sourceId);
}

public interface ICrawler
{
    Task<string> CrawlAsync(string url, CancellationToken ct);
}

public sealed class NormalizedCatalogItem
{
    public string Domain { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Dictionary<string, object> Data { get; set; } = new();
}
