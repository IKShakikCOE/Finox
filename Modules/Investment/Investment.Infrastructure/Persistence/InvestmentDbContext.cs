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

    public string CurrentOwnerId => _currentUser.IsAuthenticated ? (_currentUser.Id ?? string.Empty) : string.Empty;
    public string CurrentUsername => _currentUser.IsAuthenticated ? (_currentUser.Username ?? string.Empty) : string.Empty;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InvestmentDbContext).Assembly);

        modelBuilder.Entity<Campaign>().ToTable("campaigns");
        modelBuilder.Entity<Platform>().ToTable("platforms");

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IOwnedEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var ownerProperty = Expression.Property(parameter, nameof(IOwnedEntity.OwnerId));
                var currentOwner = Expression.Property(Expression.Constant(this), nameof(CurrentOwnerId));
                var currentUsername = Expression.Property(Expression.Constant(this), nameof(CurrentUsername));

                var isNull = Expression.Equal(ownerProperty, Expression.Constant(null, typeof(string)));
                var isEmpty = Expression.Equal(ownerProperty, Expression.Constant("", typeof(string)));
                var equalsOwner = Expression.Equal(ownerProperty, currentOwner);
                var equalsUsername = Expression.Equal(ownerProperty, currentUsername);

                var body = Expression.OrElse(isNull, Expression.OrElse(isEmpty, Expression.OrElse(equalsOwner, equalsUsername)));
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(Expression.Lambda(body, parameter));
            }
        }
    }
}
