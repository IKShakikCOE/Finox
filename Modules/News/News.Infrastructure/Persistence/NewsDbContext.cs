using Finox.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;
using News.Domain;

namespace News.Infrastructure.Persistence;

public class NewsDbContext : DbContext
{
    public NewsDbContext(DbContextOptions<NewsDbContext> options)
        : base(options)
    {
    }

    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Platform> Platforms => Set<Platform>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Article>(a =>
        {
            a.ToTable("articles");
            a.HasKey(x => x.Id);
        });

        modelBuilder.Entity<Platform>(p =>
        {
            p.ToTable("platforms");
            p.HasKey(x => x.Id);
        });

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NewsDbContext).Assembly);
    }
}
