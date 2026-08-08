using Catalog.Domain;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Infrastructure.Persistence;

/// <summary>
/// The Catalog module's EF Core context. Catalog entities are global/read-only or catalog data.
/// </summary>
public class CatalogDbContext : DbContext
{
    public CatalogDbContext(DbContextOptions<CatalogDbContext> options)
        : base(options)
    {
    }

    public DbSet<Bank> Banks => Set<Bank>();
    public DbSet<BankProduct> BankProducts => Set<BankProduct>();
    public DbSet<BankProfile> BankProfiles => Set<BankProfile>();

    public DbSet<InsuranceCompany> InsuranceCompanies => Set<InsuranceCompany>();
    public DbSet<InsuranceProduct> InsuranceProducts => Set<InsuranceProduct>();
    public DbSet<InsuranceProfile> InsuranceProfiles => Set<InsuranceProfile>();

    public DbSet<AMC> AMCs => Set<AMC>();
    public DbSet<MutualFund> MutualFunds => Set<MutualFund>();
    public DbSet<AMCProfile> AMCProfiles => Set<AMCProfile>();

    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Platform> Platforms => Set<Platform>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CatalogDbContext).Assembly);
    }
}
