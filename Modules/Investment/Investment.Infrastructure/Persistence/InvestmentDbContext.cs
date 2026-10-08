using System.Linq.Expressions;
using Finox.Shared.Domain;
using Investment.Domain;
using Microsoft.EntityFrameworkCore;

namespace Investment.Infrastructure.Persistence;

public class InvestmentDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public InvestmentDbContext(DbContextOptions<InvestmentDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<Platform> Platforms => Set<Platform>();
    public DbSet<InvestmentLead> InvestmentLeads => Set<InvestmentLead>();
    public DbSet<AuditReport> AuditReports => Set<AuditReport>();
    public DbSet<CrawlJobRecord> CrawlJobRecords => Set<CrawlJobRecord>();

    public Guid? CurrentOwnerId => _currentUser.IsAuthenticated ? _currentUser.Id : null;
    public string CurrentUsername => _currentUser.IsAuthenticated ? (_currentUser.Username ?? string.Empty) : string.Empty;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InvestmentDbContext).Assembly);

        modelBuilder.Entity<Campaign>().ToTable("campaigns");
        modelBuilder.Entity<Platform>().ToTable("platforms");
        modelBuilder.Entity<InvestmentLead>().ToTable("investment_leads");
        modelBuilder.Entity<AuditReport>().ToTable("investment_audit_reports");
        modelBuilder.Entity<CrawlJobRecord>().ToTable("investment_crawl_jobs");

        modelBuilder.Entity<InvestmentLead>()
            .HasOne(l => l.AuditReport)
            .WithOne()
            .HasForeignKey<AuditReport>(r => r.InvestmentLeadId)
            .OnDelete(DeleteBehavior.Cascade);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IOwnedEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var ownerProperty = Expression.Property(parameter, nameof(IOwnedEntity.OwnerId));
                var currentOwner = Expression.Property(Expression.Constant(this), nameof(CurrentOwnerId));
                var isNull = Expression.Equal(ownerProperty, Expression.Constant(null, typeof(Guid?)));
                
                var equalsOwner = Expression.Equal(ownerProperty, currentOwner);
                var body = Expression.OrElse(isNull, equalsOwner);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(Expression.Lambda(body, parameter));
            }
        }
    }
}


