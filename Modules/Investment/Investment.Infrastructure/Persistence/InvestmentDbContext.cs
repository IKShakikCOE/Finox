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

    public string CurrentOwnerId => _currentUser.IsAuthenticated ? _currentUser.Id : string.Empty;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InvestmentDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IOwnedEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var ownerProperty = Expression.Property(parameter, nameof(IOwnedEntity.OwnerId));
                var currentOwner = Expression.Property(Expression.Constant(this), nameof(CurrentOwnerId));
                var body = Expression.Equal(ownerProperty, currentOwner);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(Expression.Lambda(body, parameter));
            }
        }
    }
}
