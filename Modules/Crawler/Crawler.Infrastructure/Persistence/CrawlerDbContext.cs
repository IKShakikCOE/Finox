using Crawler.Domain;
using Microsoft.EntityFrameworkCore;

namespace Crawler.Infrastructure.Persistence;

public class CrawlerDbContext : DbContext
{
    public CrawlerDbContext(DbContextOptions<CrawlerDbContext> options)
        : base(options)
    {
    }

    public DbSet<CrawlSource> CrawlSources => Set<CrawlSource>();
    public DbSet<CrawlSchedule> CrawlSchedules => Set<CrawlSchedule>();
    public DbSet<CrawlJob> CrawlJobs => Set<CrawlJob>();
    public DbSet<RawCrawlRecord> RawCrawlRecords => Set<RawCrawlRecord>();
    public DbSet<ExtractedRecord> ExtractedRecords => Set<ExtractedRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CrawlerDbContext).Assembly);
    }
}
