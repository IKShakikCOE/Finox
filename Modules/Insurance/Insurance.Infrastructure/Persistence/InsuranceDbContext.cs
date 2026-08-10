using Finox.Shared.Infrastructure;
using Insurance.Domain;
using Microsoft.EntityFrameworkCore;

namespace Insurance.Infrastructure.Persistence;

public class InsuranceDbContext : DbContext
{
    public InsuranceDbContext(DbContextOptions<InsuranceDbContext> options)
        : base(options)
    {
    }

    public DbSet<InsuranceCompany> Companies => Set<InsuranceCompany>();
    public DbSet<InsuranceProduct> InsuranceProducts => Set<InsuranceProduct>();
    public DbSet<InsuranceProfile> InsuranceProfiles => Set<InsuranceProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<InsuranceCompany>(c =>
        {
            c.ToTable("insurance_companies");
            c.HasKey(x => x.Id);
        });

        modelBuilder.Entity<InsuranceProduct>(p =>
        {
            p.ToTable("insurance_products");
            p.HasKey(x => x.Id);
        });

        modelBuilder.Entity<InsuranceProfile>(pr =>
        {
            pr.ToTable("insurance_profiles");
            pr.HasKey(x => x.Id);
        });

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InsuranceDbContext).Assembly);
    }
}
