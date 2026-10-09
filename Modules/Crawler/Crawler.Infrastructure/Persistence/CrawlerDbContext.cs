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

        modelBuilder.Entity<CrawlSource>().ToTable("crawl_sources");
        modelBuilder.Entity<CrawlSchedule>().ToTable("crawl_schedules");
        modelBuilder.Entity<CrawlJob>().ToTable("crawl_jobs");
        modelBuilder.Entity<RawCrawlRecord>().ToTable("raw_crawl_records");
        modelBuilder.Entity<ExtractedRecord>().ToTable("extracted_records");
    }
}

