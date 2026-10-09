using Bank.Domain;
using Finox.Shared.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Bank.Infrastructure.Persistence;

public class BankDbContext : DbContext
{
    public BankDbContext(DbContextOptions<BankDbContext> options)
        : base(options)
    {
    }

    public DbSet<BankEntity> Banks => Set<BankEntity>();
    public DbSet<BankProduct> BankProducts => Set<BankProduct>();
    public DbSet<BankProfile> BankProfiles => Set<BankProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BankEntity>(b =>
        {
            b.ToTable("banks");
            b.HasKey(x => x.Id);
        });

        modelBuilder.Entity<BankProduct>(p =>
        {
            p.ToTable("bank_products");
            p.HasKey(x => x.Id);
        });

        modelBuilder.Entity<BankProfile>(pr =>
        {
            pr.ToTable("bank_profiles");
            pr.HasKey(x => x.Id);
        });

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BankDbContext).Assembly);
    }
}

