using Finox.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;
using MutualFunds.Domain;

namespace MutualFunds.Infrastructure.Persistence;

public class MutualFundsDbContext : DbContext
{
    public MutualFundsDbContext(DbContextOptions<MutualFundsDbContext> options)
        : base(options)
    {
    }

    public DbSet<AMC> Amcs => Set<AMC>();
    public DbSet<MutualFund> MutualFunds => Set<MutualFund>();
    public DbSet<AMCProfile> AmcProfiles => Set<AMCProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AMC>(a =>
        {
            a.ToTable("amcs");
            a.HasKey(x => x.Id);
        });

        modelBuilder.Entity<MutualFund>(mf =>
        {
            mf.ToTable("mutual_funds");
            mf.HasKey(x => x.Id);
        });

        modelBuilder.Entity<AMCProfile>(ap =>
        {
            ap.ToTable("amc_profiles");
            ap.HasKey(x => x.Id);
        });

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MutualFundsDbContext).Assembly);
    }
}

